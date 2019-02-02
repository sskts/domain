/**
 * 配送サービス
 * ここでいう「配送」とは、「エンドユーザーが取得した所有権を利用可能な状態にすること」を指します。
 * つまり、物理的なモノの配送だけに限らず、
 * 座席予約で言えば、入場可能、つまり、QRコードが所有権として発行されること
 * ポイントインセンティブで言えば、口座に振り込まれること
 * などが配送処理として考えられます。
 */
import * as COA from '@motionpicture/coa-service';
import * as pecorinoapi from '@pecorino/api-nodejs-client';
import * as createDebug from 'debug';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import * as moment from 'moment';

import { MongoRepository as ActionRepo } from '../repo/action';
import { RedisRepository as RegisterProgramMembershipActionInProgressRepo } from '../repo/action/registerProgramMembershipInProgress';
import { MongoRepository as OrderRepo } from '../repo/order';
import { MongoRepository as OwnershipInfoRepo } from '../repo/ownershipInfo';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

import * as factory from '../factory';

const debug = createDebug('sskts-domain:service:delivery');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

/**
 * 注文を配送する
 * COAに本予約連携を行い、内部的には所有権を作成する
 * @param transactionId 注文取引ID
 */
export function sendOrder(transactionId: string) {
    // tslint:disable-next-line:max-func-body-length
    return async (repos: {
        action: ActionRepo;
        order: OrderRepo;
        ownershipInfo: OwnershipInfoRepo;
        registerActionInProgressRepo: RegisterProgramMembershipActionInProgressRepo;
        transaction: TransactionRepo;
        task: TaskRepo;
    }) => {
        const transaction = await repos.transaction.findById({
            typeOf: factory.transactionType.PlaceOrder,
            id: transactionId
        });
        const transactionResult = transaction.result;
        if (transactionResult === undefined) {
            throw new factory.errors.NotFound('transaction.result');
        }
        const potentialActions = transaction.potentialActions;
        if (potentialActions === undefined) {
            throw new factory.errors.NotFound('transaction.potentialActions');
        }

        const seatReservationAuthorizeActions = <factory.action.authorize.offer.seatReservation.IAction[]>
            transaction.object.authorizeActions
                .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
                .filter((a) => a.object.typeOf === factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation);
        // if (authorizeActions.length !== 1) {
        //     throw new factory.errors.NotImplemented('Number of seat reservation authorizeAction must be 1.');
        // }

        const customerContact = transaction.object.customerContact;
        if (customerContact === undefined) {
            throw new factory.errors.NotFound('transaction.object.customerContact');
        }
        const orderPotentialActions = potentialActions.order.potentialActions;
        if (orderPotentialActions === undefined) {
            throw new factory.errors.NotFound('order.potentialActions');
        }

        // アクション開始
        const sendOrderActionAttributes = orderPotentialActions.sendOrder;
        const action = await repos.action.start(sendOrderActionAttributes);

        try {
            // 座席予約があればCOA本予約
            const seatReservationAuthorizeAction = seatReservationAuthorizeActions.shift();
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (seatReservationAuthorizeAction !== undefined) {
                const seatReservationAuthorizeActionResult = seatReservationAuthorizeAction.result;
                if (seatReservationAuthorizeActionResult === undefined) {
                    throw new factory.errors.NotFound('authorizeAction.result');
                }

                const updTmpReserveSeatArgs = seatReservationAuthorizeActionResult.updTmpReserveSeatArgs;
                const updTmpReserveSeatResult = seatReservationAuthorizeActionResult.updTmpReserveSeatResult;
                const order = transactionResult.order;

                // 電話番号のフォーマットを日本人にリーダブルに調整(COAではこのフォーマットで扱うので)
                const phoneUtil = PhoneNumberUtil.getInstance();
                const phoneNumber = phoneUtil.parse(customerContact.telephone, 'JP');
                let telNum = phoneUtil.format(phoneNumber, PhoneNumberFormat.NATIONAL);

                // COAでは数字のみ受け付けるので数字以外を除去
                telNum = telNum.replace(/[^\d]/g, '');

                // この資産移動ファンクション自体はリトライ可能な前提でつくる必要があるので、要注意
                // すでに本予約済みかどうか確認
                const stateReserveResult = await COA.services.reserve.stateReserve({
                    theaterCode: updTmpReserveSeatArgs.theaterCode,
                    reserveNum: updTmpReserveSeatResult.tmpReserveNum,
                    telNum: telNum
                });

                // COA本予約
                // 未本予約であれば実行(COA本予約は一度成功すると成功できない)
                if (stateReserveResult === null) {
                    await COA.services.reserve.updReserve({
                        theaterCode: updTmpReserveSeatArgs.theaterCode,
                        dateJouei: updTmpReserveSeatArgs.dateJouei,
                        titleCode: updTmpReserveSeatArgs.titleCode,
                        titleBranchNum: updTmpReserveSeatArgs.titleBranchNum,
                        timeBegin: updTmpReserveSeatArgs.timeBegin,
                        tmpReserveNum: updTmpReserveSeatResult.tmpReserveNum,
                        // tslint:disable-next-line:no-irregular-whitespace
                        reserveName: `${customerContact.familyName}　${customerContact.givenName}`,
                        // tslint:disable-next-line:no-irregular-whitespace
                        reserveNameJkana: `${customerContact.familyName}　${customerContact.givenName}`,
                        telNum: telNum,
                        mailAddr: customerContact.email,
                        reserveAmount: order.price, // デフォルトのpriceCurrencyがJPYなのでこれでよし
                        listTicket: order.acceptedOffers.map(
                            (offer) => (<factory.reservation.event.IEventReservation<any>>offer.itemOffered).reservedTicket.coaTicketInfo
                        )
                    });
                }
            }

            await Promise.all(transactionResult.ownershipInfos.map(async (ownershipInfo) => {
                await repos.ownershipInfo.save(ownershipInfo);
            }));

            // 注文ステータス変更
            await repos.order.changeStatus(transactionResult.order.orderNumber, factory.orderStatus.OrderDelivered);

            // 会員プログラムがアイテムにある場合は、所有権が作成されたこのタイミングで登録プロセスロック解除
            const programMembershipOwnershipInfos = <factory.ownershipInfo.IOwnershipInfo<'ProgramMembership'>[]>
                transactionResult.ownershipInfos.filter((o) => o.typeOfGood.typeOf === 'ProgramMembership');
            await Promise.all(programMembershipOwnershipInfos.map(async (o) => {
                const memberOf = <factory.programMembership.IProgramMembership>(<factory.person.IPerson>o.ownedBy).memberOf;
                await repos.registerActionInProgressRepo.unlock({
                    membershipNumber: <string>memberOf.membershipNumber,
                    programMembershipId: <string>o.typeOfGood.id
                });
            }));
        } catch (error) {
            // actionにエラー結果を追加
            try {
                const actionError = { ...error, ...{ message: error.message, name: error.name } };
                await repos.action.giveUp({ typeOf: sendOrderActionAttributes.typeOf, id: action.id, error: actionError });
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw error;
        }

        // アクション完了
        debug('ending action...');
        await repos.action.complete({ typeOf: sendOrderActionAttributes.typeOf, id: action.id, result: {} });

        // 潜在アクション
        await onSend(sendOrderActionAttributes)({ task: repos.task });
    };
}

/**
 * 注文配送後のアクション
 * @param transactionId 注文取引ID
 * @param sendOrderActionAttributes 注文配送悪損属性
 */
function onSend(sendOrderActionAttributes: factory.action.transfer.send.order.IAttributes) {
    return async (repos: { task: TaskRepo }) => {
        const potentialActions = sendOrderActionAttributes.potentialActions;
        const now = new Date();
        const taskAttributes: factory.task.IAttributes<factory.taskName>[] = [];

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (potentialActions !== undefined) {
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (potentialActions.sendEmailMessage !== undefined) {
                // 互換性維持のため、すでにメール送信タスクが存在するかどうか確認し、なければタスク追加
                const sendEmailMessageTaskDoc = await repos.task.taskModel.findOne({
                    name: factory.taskName.SendEmailMessage,
                    'data.actionAttributes.object.identifier': {
                        $exists: true,
                        $eq: potentialActions.sendEmailMessage.object.identifier
                    }
                }).exec();
                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore else */
                if (sendEmailMessageTaskDoc === null) {
                    const sendEmailMessageTask: factory.task.IAttributes<factory.taskName.SendEmailMessage> = {
                        name: factory.taskName.SendEmailMessage,
                        status: factory.taskStatus.Ready,
                        runsAt: now, // なるはやで実行
                        remainingNumberOfTries: 3,
                        numberOfTried: 0,
                        executionResults: [],
                        data: {
                            actionAttributes: potentialActions.sendEmailMessage
                        }
                    };
                    taskAttributes.push(sendEmailMessageTask);
                }
            }

            // 会員プログラム更新タスクがあれば追加
            if (Array.isArray(potentialActions.registerProgramMembership)) {
                taskAttributes.push(...potentialActions.registerProgramMembership);
            }
        }

        // タスク保管
        await Promise.all(taskAttributes.map(async (taskAttribute) => {
            return repos.task.save(taskAttribute);
        }));
    };
}

/**
 * ポイントインセンティブ入金実行
 * 取引中に入金取引の承認アクションを完了しているはずなので、その取引を確定するだけの処理です。
 */
export function givePointAward(params: factory.task.IData<factory.taskName.GivePointAward>) {
    return async (repos: {
        action: ActionRepo;
        pecorinoAuthClient: pecorinoapi.auth.ClientCredentials;
    }) => {
        // アクション開始
        const action = await repos.action.start(params);

        try {
            // 入金取引確定
            const depositService = new pecorinoapi.service.transaction.Deposit({
                endpoint: params.object.pecorinoEndpoint,
                auth: repos.pecorinoAuthClient
            });
            await depositService.confirm({ transactionId: params.object.pecorinoTransaction.id });
        } catch (error) {
            // actionにエラー結果を追加
            try {
                // tslint:disable-next-line:max-line-length no-single-line-block-comment
                const actionError = { ...error, ...{ message: error.message, name: error.name } };
                await repos.action.giveUp({ typeOf: params.typeOf, id: action.id, error: actionError });
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw error;
        }

        // アクション完了
        debug('ending action...');
        const actionResult: factory.action.transfer.give.pointAward.IResult = {};
        await repos.action.complete({ typeOf: params.typeOf, id: action.id, result: actionResult });
    };
}

/**
 * ポイントインセンティブ返却実行
 */
export function returnPointAward(params: factory.task.IData<factory.taskName.ReturnPointAward>) {
    return async (repos: {
        action: ActionRepo;
        pecorinoAuthClient: pecorinoapi.auth.ClientCredentials;
    }) => {
        // アクション開始
        const placeOrderTransaction = params.object.purpose;
        const pointAwardAuthorizeActionResult = params.object.result;
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (pointAwardAuthorizeActionResult === undefined) {
            throw new factory.errors.NotFound('params.object.result');
        }

        let withdrawTransaction: pecorinoapi.factory.transaction.withdraw.ITransaction<factory.accountType.Point>;
        const action = await repos.action.start(params);

        try {
            // 入金した分を引き出し取引実行
            const withdrawService = new pecorinoapi.service.transaction.Withdraw({
                endpoint: pointAwardAuthorizeActionResult.pecorinoEndpoint,
                auth: repos.pecorinoAuthClient
            });
            withdrawTransaction = await withdrawService.start({
                // tslint:disable-next-line:no-magic-numbers
                expires: moment().add(5, 'minutes').toDate(),
                agent: {
                    typeOf: placeOrderTransaction.agent.typeOf,
                    id: placeOrderTransaction.agent.id,
                    name: `sskts-placeOrder-transaction-${placeOrderTransaction.id}`,
                    url: placeOrderTransaction.agent.url
                },
                recipient: {
                    typeOf: placeOrderTransaction.seller.typeOf,
                    id: placeOrderTransaction.seller.id,
                    name: placeOrderTransaction.seller.name.ja,
                    url: placeOrderTransaction.seller.url
                },
                amount: pointAwardAuthorizeActionResult.pecorinoTransaction.object.amount,
                notes: 'シネマサンシャイン 返品によるポイントインセンティブ取消',
                accountType: factory.accountType.Point,
                fromAccountNumber: pointAwardAuthorizeActionResult.pecorinoTransaction.object.toAccountNumber
            });
            await withdrawService.confirm({ transactionId: withdrawTransaction.id });
        } catch (error) {
            // actionにエラー結果を追加
            try {
                const actionError = { ...error, ...{ message: error.message, name: error.name } };
                await repos.action.giveUp({ typeOf: action.typeOf, id: action.id, error: actionError });
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw error;
        }

        // アクション完了
        debug('ending action...');
        const actionResult: factory.action.transfer.returnAction.pointAward.IResult = {
            pecorinoTransaction: withdrawTransaction
        };
        await repos.action.complete({ typeOf: action.typeOf, id: action.id, result: actionResult });
    };
}

/**
 * ポイントインセンティブ承認取消
 * @param params.transactionId 取引ID
 */
export function cancelPointAward(params: {
    transactionId: string;
}) {
    return async (repos: {
        action: ActionRepo;
        pecorinoAuthClient: pecorinoapi.auth.ClientCredentials;
    }) => {
        // ポイントインセンティブ承認アクションを取得
        const authorizeActions = <factory.action.authorize.award.point.IAction[]>
            await repos.action.searchByPurpose({
                typeOf: factory.actionType.AuthorizeAction,
                purpose: {
                    typeOf: factory.transactionType.PlaceOrder,
                    id: params.transactionId
                }
            })
                .then((actions) => actions
                    .filter((a) => a.object.typeOf === factory.action.authorize.award.point.ObjectType.PointAward)
                    .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
                );

        await Promise.all(authorizeActions.map(async (action) => {
            // 承認アクション結果は基本的に必ずあるはず
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore if */
            if (action.result === undefined) {
                throw new factory.errors.NotFound('action.result');
            }

            // 進行中の入金取引を中止する
            const depositService = new pecorinoapi.service.transaction.Deposit({
                endpoint: action.result.pecorinoEndpoint,
                auth: repos.pecorinoAuthClient
            });
            await depositService.cancel({
                transactionId: action.result.pecorinoTransaction.id
            });
        }));
    };
}
