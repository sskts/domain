/**
 * 配送サービス
 * ここでいう「配送」とは、「エンドユーザーが取得した所有権を利用可能な状態にすること」を指します。
 * つまり、物理的なモノの配送だけに限らず、
 * 座席予約で言えば、入場可能、つまり、QRコードが所有権として発行されること
 * ポイントインセンティブで言えば、口座に振り込まれること
 * などが配送処理として考えられます。
 */
import { service } from '@cinerino/domain';
import * as createDebug from 'debug';
import * as moment from 'moment-timezone';
import * as util from 'util';

import { MongoRepository as ActionRepo } from '../repo/action';
import { RedisRepository as RegisterProgramMembershipActionInProgressRepo } from '../repo/action/registerProgramMembershipInProgress';
import { MongoRepository as OrderRepo } from '../repo/order';
import { MongoRepository as OwnershipInfoRepo } from '../repo/ownershipInfo';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

import * as factory from '../factory';

const debug = createDebug('sskts-domain:service:delivery');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
export type IEventReservation = factory.reservation.event.IReservation<any>;
export type IOwnershipInfo = factory.ownershipInfo.IOwnershipInfo<factory.ownershipInfo.IGood<factory.ownershipInfo.IGoodType>>;

/**
 * 注文を配送する
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
export function sendOrder(params: factory.action.transfer.send.order.IAttributes) {
    // tslint:disable-next-line:max-func-body-length
    return async (repos: {
        action: ActionRepo;
        order: OrderRepo;
        ownershipInfo: OwnershipInfoRepo;
        registerActionInProgressRepo: RegisterProgramMembershipActionInProgressRepo;
        transaction: TransactionRepo;
        task: TaskRepo;
    }) => {
        const order = params.object;
        const placeOrderTransactions = await repos.transaction.search<factory.transactionType.PlaceOrder>({
            typeOf: factory.transactionType.PlaceOrder,
            result: { order: { orderNumbers: [order.orderNumber] } }
        });
        const placeOrderTransaction = placeOrderTransactions.shift();
        if (placeOrderTransaction === undefined) {
            throw new factory.errors.NotFound('Transaction');
        }
        const transactionResult = placeOrderTransaction.result;
        if (transactionResult === undefined) {
            throw new factory.errors.NotFound('transaction.result');
        }

        const customerContact = placeOrderTransaction.object.customerContact;
        if (customerContact === undefined) {
            throw new factory.errors.NotFound('transaction.object.customerContact');
        }

        // アクション開始
        const action = await repos.action.start(params);
        let ownershipInfos: IOwnershipInfo[];

        try {
            // 所有権作成
            ownershipInfos = createOwnershipInfosFromTransaction({ order });
            await Promise.all(ownershipInfos.map(async (ownershipInfo) => {
                await repos.ownershipInfo.saveByIdentifier(ownershipInfo);
            }));

            // 注文ステータス変更
            await repos.order.changeStatus({
                orderNumber: transactionResult.order.orderNumber,
                orderStatus: factory.orderStatus.OrderDelivered
            });

            // 会員プログラムがアイテムにある場合は、所有権が作成されたこのタイミングで登録プロセスロック解除
            const programMembershipOwnershipInfos =
                <factory.ownershipInfo.IOwnershipInfo<factory.ownershipInfo.IGood<'ProgramMembership'>>[]>
                ownershipInfos.filter((o) => o.typeOfGood.typeOf === 'ProgramMembership');
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
                await repos.action.giveUp({ typeOf: params.typeOf, id: action.id, error: actionError });
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw error;
        }

        // アクション完了
        debug('ending action...');
        const result: factory.action.transfer.send.order.IResult = {
            ownershipInfos: ownershipInfos
        };
        await repos.action.complete({ typeOf: params.typeOf, id: action.id, result: result });

        // 潜在アクション
        await onSend(params)({ task: repos.task });
    };
}

/**
 * 取引から所有権を作成する
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
export function createOwnershipInfosFromTransaction(params: {
    order: factory.order.IOrder;
}): IOwnershipInfo[] {
    return params.order.acceptedOffers.map((acceptedOffer, offerIndex) => {
        const itemOffered = acceptedOffer.itemOffered;
        let ownershipInfo: IOwnershipInfo;
        const identifier = util.format(
            '%s-%s-%s',
            itemOffered.typeOf,
            params.order.orderNumber,
            offerIndex
        );
        const ownedFrom = params.order.orderDate;
        const seller = params.order.seller;
        let ownedThrough: Date;

        switch (itemOffered.typeOf) {
            case 'ProgramMembership':
                // どういう期間でいくらのオファーなのか
                const eligibleDuration = acceptedOffer.eligibleDuration;
                if (eligibleDuration === undefined) {
                    throw new factory.errors.NotFound('Order.acceptedOffers.eligibleDuration');
                }
                // 期間単位としては秒のみ実装
                if (eligibleDuration.unitCode !== factory.unitCode.Sec) {
                    throw new factory.errors.NotImplemented('Only \'SEC\' is implemented for eligibleDuration.unitCode ');
                }
                ownedThrough = moment(params.order.orderDate).add(eligibleDuration.value, 'seconds').toDate();
                ownershipInfo = {
                    id: '',
                    typeOf: <factory.ownershipInfo.OwnershipInfoType>'OwnershipInfo',
                    identifier: identifier,
                    ownedBy: params.order.customer,
                    acquiredFrom: {
                        id: seller.id,
                        typeOf: seller.typeOf,
                        name: {
                            ja: seller.name,
                            en: ''
                        },
                        telephone: seller.telephone,
                        url: seller.url
                    },
                    ownedFrom: ownedFrom,
                    ownedThrough: ownedThrough,
                    typeOfGood: itemOffered
                };

                break;

            case factory.reservationType.EventReservation:
                // ownershipInfoのidentifierはコレクション内でuniqueである必要があるので、この仕様には要注意
                // saveする際に、identifierでfindOneAndUpdateしている
                // const identifier = `${acceptedOffer.itemOffered.typeOf}-${acceptedOffer.itemOffered.reservedTicket.ticketToken}`;
                // イベント予約に対する所有権の有効期限はイベント終了日時までで十分だろう
                // 現時点では所有権対象がイベント予約のみなので、これで問題ないが、
                // 対象が他に広がれば、有効期間のコントロールは別でしっかり行う必要があるだろう
                ownedThrough = itemOffered.reservationFor.endDate;

                ownershipInfo = {
                    id: '',
                    typeOf: <factory.ownershipInfo.OwnershipInfoType>'OwnershipInfo',
                    identifier: identifier,
                    ownedBy: params.order.customer,
                    acquiredFrom: {
                        id: seller.id,
                        typeOf: seller.typeOf,
                        name: {
                            ja: seller.name,
                            en: ''
                        },
                        telephone: seller.telephone,
                        url: seller.url
                    },
                    ownedFrom: ownedFrom,
                    ownedThrough: ownedThrough,
                    typeOfGood: itemOffered
                };

                break;

            default:
                throw new factory.errors.NotImplemented(`Offered item type ${(<any>itemOffered).typeOf} not implemented`);
        }

        return ownershipInfo;
    });
}

/**
 * 注文配送後のアクション
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
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

export const givePointAward = service.delivery.givePointAward;
export const returnPointAward = service.delivery.returnPointAward;
export const cancelPointAward = service.delivery.cancelPointAward;
