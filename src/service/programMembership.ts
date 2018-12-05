/**
 * 会員プログラムサービス
 */
import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as pecorinoapi from '@pecorino/api-nodejs-client';
import * as createDebug from 'debug';
import * as moment from 'moment-timezone';
import * as util from 'util';

import * as CreditCardService from './person/creditCard';
import * as PlaceOrderService from './transaction/placeOrderInProgress';

import { MongoRepository as ActionRepo } from '../repo/action';
import { RedisRepository as RegisterProgramMembershipActionInProgressRepo } from '../repo/action/registerProgramMembershipInProgress';
import { RedisRepository as OrderNumberRepo } from '../repo/orderNumber';
import { MongoRepository as OrganizationRepo } from '../repo/organization';
import { MongoRepository as OwnershipInfoRepo } from '../repo/ownershipInfo';
import { CognitoRepository as PersonRepo } from '../repo/person';
import { MongoRepository as ProgramMembershipRepo } from '../repo/programMembership';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

import { handlePecorinoError } from '../errorHandler';

const debug = createDebug('sskts-domain:service:programMembership');

export type ICreateRegisterTaskOperation<T> = (repos: {
    organization: OrganizationRepo;
    programMembership: ProgramMembershipRepo;
    task: TaskRepo;
}) => Promise<T>;
export type ICreateUnRegisterTaskOperation<T> = (repos: {
    ownershipInfo: OwnershipInfoRepo;
    task: TaskRepo;
}) => Promise<T>;

export type IRegisterOperation<T> = (repos: {
    action: ActionRepo;
    orderNumber: OrderNumberRepo;
    organization: OrganizationRepo;
    ownershipInfo: OwnershipInfoRepo;
    person: PersonRepo;
    programMembership: ProgramMembershipRepo;
    registerActionInProgressRepo: RegisterProgramMembershipActionInProgressRepo;
    transaction: TransactionRepo;
    depositService?: pecorinoapi.service.transaction.Deposit;
}) => Promise<T>;

/**
 * 会員プログラム登録タスクを作成する
 */
export function createRegisterTask(params: {
    agent: factory.person.IPerson;
    seller: {
        /**
         * 販売者タイプ
         * どの販売者に属した会員プログラムを登録するか
         */
        typeOf: factory.organizationType;
        /**
         * 販売者ID
         * どの販売者に属した会員プログラムを登録するか
         */
        id: string;
    };
    /**
     * 会員プログラムID
     */
    programMembershipId: string;
    /**
     * 会員プログラムのオファー識別子
     */
    offerIdentifier: string;
}): ICreateRegisterTaskOperation<factory.task.ITask<factory.taskName.RegisterProgramMembership>> {
    return async (repos: {
        organization: OrganizationRepo;
        programMembership: ProgramMembershipRepo;
        task: TaskRepo;
    }) => {
        const now = new Date();
        const programMemberships = await repos.programMembership.search({ id: params.programMembershipId });
        const programMembership = programMemberships.shift();
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (programMembership === undefined) {
            throw new factory.errors.NotFound('ProgramMembership');
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (programMembership.offers === undefined) {
            throw new factory.errors.NotFound('ProgramMembership.offers');
        }
        const offer = programMembership.offers.find((o) => o.identifier === params.offerIdentifier);
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (offer === undefined) {
            throw new factory.errors.NotFound('Offer');
        }
        const seller = await repos.organization.findById(params.seller.typeOf, params.seller.id);
        // 会員プログラムのホスト組織確定(この組織が決済対象となる)
        programMembership.hostingOrganization = {
            id: seller.id,
            identifier: seller.identifier,
            name: seller.name,
            legalName: seller.legalName,
            location: seller.location,
            typeOf: seller.typeOf,
            telephone: seller.telephone,
            url: seller.url
        };

        // 受け入れれたオファーオブジェクトを作成
        const acceptedOffer: factory.order.IAcceptedOffer<factory.programMembership.IProgramMembership> = {
            typeOf: 'Offer',
            identifier: offer.identifier,
            price: offer.price,
            priceCurrency: offer.priceCurrency,
            eligibleDuration: offer.eligibleDuration,
            itemOffered: programMembership,
            seller: {
                typeOf: seller.typeOf,
                name: seller.name.ja
            }
        };
        // 登録アクション属性を作成
        const registerActionAttributes: factory.action.interact.register.programMembership.IAttributes = {
            typeOf: factory.actionType.RegisterAction,
            agent: params.agent,
            object: acceptedOffer
            // potentialActions?: any;
        };
        // 会員プログラム登録タスクを作成する
        const taskAttributes: factory.task.registerProgramMembership.IAttributes = {
            name: factory.taskName.RegisterProgramMembership,
            status: factory.taskStatus.Ready,
            runsAt: now,
            remainingNumberOfTries: 10,
            lastTriedAt: null,
            numberOfTried: 0,
            executionResults: [],
            data: registerActionAttributes
        };

        return repos.task.save<factory.taskName.RegisterProgramMembership>(taskAttributes);
    };
}

/**
 * 会員プログラム登録
 */
export function register(
    params: factory.action.interact.register.programMembership.IAttributes
): IRegisterOperation<void> {
    return async (repos: {
        action: ActionRepo;
        orderNumber: OrderNumberRepo;
        organization: OrganizationRepo;
        ownershipInfo: OwnershipInfoRepo;
        person: PersonRepo;
        programMembership: ProgramMembershipRepo;
        registerActionInProgressRepo: RegisterProgramMembershipActionInProgressRepo;
        transaction: TransactionRepo;
        depositService: pecorinoapi.service.transaction.Deposit;
    }) => {
        const now = new Date();

        const customer = (<factory.person.IPerson>params.agent);
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (customer.memberOf === undefined) {
            throw new factory.errors.NotFound('params.agent.memberOf');
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (customer.memberOf.membershipNumber === undefined) {
            throw new factory.errors.NotFound('params.agent.memberOf.membershipNumber');
        }
        const programMembershipId = params.object.itemOffered.id;
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (programMembershipId === undefined) {
            throw new factory.errors.NotFound('params.object.itemOffered.id');
        }

        const programMemberships = await repos.ownershipInfo.search({
            goodType: 'ProgramMembership',
            ownedBy: customer.memberOf.membershipNumber,
            ownedAt: now
        });
        // すでに会員プログラムに加入済であれば何もしない
        const selectedProgramMembership = programMemberships.find((p) => p.typeOfGood.id === params.object.itemOffered.id);
        if (selectedProgramMembership !== undefined) {
            debug('Already registered.');

            return;
        }

        // アクション開始
        const action = await repos.action.start(params);

        let order: factory.order.IOrder;
        let lockNumber: number | undefined;
        try {
            // 登録処理を進行中に変更。進行中であれば競合エラー。
            lockNumber = await repos.registerActionInProgressRepo.lock(
                {
                    membershipNumber: customer.memberOf.membershipNumber,
                    programMembershipId: programMembershipId
                },
                action.id
            );

            order = await processPlaceOrder({
                registerActionAttributes: params
            })(repos);
        } catch (error) {
            // actionにエラー結果を追加
            try {
                // tslint:disable-next-line:max-line-length no-single-line-block-comment
                const actionError = { ...error, ...{ message: error.message, name: error.name } };
                await repos.action.giveUp(action.typeOf, action.id, actionError);
            } catch (__) {
                // 失敗したら仕方ない
            }

            try {
                // 本プロセスがlockした場合は解除する。解除しなければタスクのリトライが無駄になってしまう。
                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore else */
                if (lockNumber !== undefined) {
                    await repos.registerActionInProgressRepo.unlock({
                        membershipNumber: customer.memberOf.membershipNumber,
                        programMembershipId: programMembershipId
                    });
                }
            } catch (error) {
                // 失敗したら仕方ない
            }

            throw error;
        }

        // アクション完了
        debug('ending action...');
        const actionResult: factory.action.interact.register.programMembership.IResult = {
            order: order
        };

        await repos.action.complete(action.typeOf, action.id, actionResult);
    };
}

/**
 * 会員プログラム登録解除タスクを作成する
 */
export function createUnRegisterTask(params: {
    agent: factory.person.IPerson;
    /**
     * 所有権識別子
     */
    ownershipInfoIdentifier: string;
}): ICreateUnRegisterTaskOperation<factory.task.ITask<factory.taskName.UnRegisterProgramMembership>> {
    return async (repos: {
        ownershipInfo: OwnershipInfoRepo;
        task: TaskRepo;
    }) => {
        // 所有している会員プログラムを検索
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (params.agent.memberOf === undefined) {
            throw new factory.errors.NotFound('params.agent.memberOf');
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (params.agent.memberOf.membershipNumber === undefined) {
            throw new factory.errors.NotFound('params.agent.memberOf.membershipNumber');
        }
        const now = new Date();
        const ownershipInfos = await repos.ownershipInfo.search({
            identifier: params.ownershipInfoIdentifier,
            goodType: 'ProgramMembership',
            ownedBy: params.agent.memberOf.membershipNumber,
            ownedAt: now
        });
        const ownershipInfo = ownershipInfos.shift();
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if: please write tests */
        if (ownershipInfo === undefined) {
            throw new factory.errors.NotFound('OwnershipInfo');
        }

        // 所有が確認できれば、会員プログラム登録解除タスクを作成する
        const unRegisterActionAttributes: factory.action.interact.unRegister.programMembership.IAttributes = {
            typeOf: factory.actionType.UnRegisterAction,
            agent: params.agent,
            object: ownershipInfo
        };
        const taskAttributes: factory.task.unRegisterProgramMembership.IAttributes = {
            name: factory.taskName.UnRegisterProgramMembership,
            status: factory.taskStatus.Ready,
            runsAt: now,
            remainingNumberOfTries: 10,
            lastTriedAt: null,
            numberOfTried: 0,
            executionResults: [],
            data: unRegisterActionAttributes
        };

        return repos.task.save<factory.taskName.UnRegisterProgramMembership>(taskAttributes);
    };
}

/**
 * 会員プログラム登録解除
 */
export function unRegister(params: factory.action.interact.unRegister.programMembership.IAttributes) {
    return async (repos: {
        action: ActionRepo;
        ownershipInfo: OwnershipInfoRepo;
        task: TaskRepo;
        person?: PersonRepo;
    }) => {
        // アクション開始
        const action = await repos.action.start(params);

        try {
            const memberOf = (<factory.person.IPerson>params.object.ownedBy).memberOf;
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore if */
            if (memberOf === undefined) {
                throw new factory.errors.NotFound('params.object.ownedBy.memberOf');
            }
            const membershipNumber = memberOf.membershipNumber;
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore if */
            if (membershipNumber === undefined) {
                throw new factory.errors.NotFound('params.object.ownedBy.memberOf.membershipNumber');
            }
            const programMembershipId = params.object.typeOfGood.id;
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore if */
            if (programMembershipId === undefined) {
                throw new factory.errors.NotFound('params.object.typeOfGood.id');
            }

            // 会員プログラム更新タスク(継続課金タスク)をキャンセル
            await repos.task.taskModel.findOneAndUpdate(
                {
                    name: factory.taskName.RegisterProgramMembership,
                    status: factory.taskStatus.Ready,
                    'data.agent.memberOf.membershipNumber': {
                        $exists: true,
                        $eq: membershipNumber

                    },
                    'data.object.itemOffered.id': {
                        $exists: true,
                        $eq: programMembershipId
                    }
                },
                { status: factory.taskStatus.Aborted }
            ).exec();

            // 所有権の期限変更
            await repos.ownershipInfo.ownershipInfoModel.findOneAndUpdate(
                { identifier: params.object.identifier },
                { ownedThrough: new Date() }
            ).exec();

            if (repos.person !== undefined) {
                const customer = (<factory.person.IPerson>params.agent);
                if (customer.memberOf === undefined) {
                    throw new factory.errors.NotFound('params.agent.memberOf');
                }
                if (customer.memberOf.membershipNumber === undefined) {
                    throw new factory.errors.NotFound('params.agent.memberOf.membershipNumber');
                }

                // Cognitoユーザを無効にする
                await repos.person.unregister({
                    userPooId: <string>process.env.COGNITO_USER_POOL_ID,
                    username: customer.memberOf.membershipNumber
                });
            }
        } catch (error) {
            // actionにエラー結果を追加
            try {
                // tslint:disable-next-line:max-line-length no-single-line-block-comment
                const actionError = { ...error, ...{ message: error.message, name: error.name } };
                await repos.action.giveUp(action.typeOf, action.id, actionError);
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw error;
        }

        // アクション完了
        debug('ending action...');
        const actionResult: factory.action.interact.unRegister.programMembership.IResult = {};

        await repos.action.complete(action.typeOf, action.id, actionResult);
    };
}

/**
 * 会員プログラム登録アクション属性から、会員プログラムを注文する
 */
function processPlaceOrder(params: {
    registerActionAttributes: factory.action.interact.register.programMembership.IAttributes;
}) {
    // tslint:disable-next-line:max-func-body-length
    return async (repos: {
        action: ActionRepo;
        orderNumber: OrderNumberRepo;
        organization: OrganizationRepo;
        person: PersonRepo;
        programMembership: ProgramMembershipRepo;
        transaction: TransactionRepo;
        depositService: pecorinoapi.service.transaction.Deposit;
        ownershipInfo: OwnershipInfoRepo;
    }) => {
        const programMembership = params.registerActionAttributes.object.itemOffered;
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (programMembership.offers === undefined) {
            throw new factory.errors.NotFound('ProgramMembership.offers');
        }
        const acceptedOffer = params.registerActionAttributes.object;
        const seller = programMembership.hostingOrganization;
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (seller === undefined) {
            throw new factory.errors.NotFound('ProgramMembership.hostingOrganization');
        }
        const customer = (<factory.person.IPerson>params.registerActionAttributes.agent);
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (customer.memberOf === undefined) {
            throw new factory.errors.NotFound('params.agent.memberOf');
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (customer.memberOf.membershipNumber === undefined) {
            throw new factory.errors.NotFound('params.agent.memberOf.membershipNumber');
        }

        // 会員プログラム注文取引進行
        // 会員プログラム更新タスク作成は、注文後のアクションに定義すればよいか
        const transaction = await PlaceOrderService.start({
            // tslint:disable-next-line:no-magic-numbers
            expires: moment().add(5, 'minutes').toDate(),
            customer: customer,
            seller: {
                typeOf: seller.typeOf,
                id: seller.id
            },
            clientUser: <any>{}
            // passportToken:
        })(repos);
        debug('transaction started', transaction.id);

        // シネサンのスマフォアプリ登録時、元から1ポイント追加される
        if (repos.depositService !== undefined) {
            const now = new Date();
            const accountOwnershipInfos = await repos.ownershipInfo.search({
                goodType: factory.pecorino.account.TypeOf.Account,
                ownedBy: customer.memberOf.membershipNumber,
                ownedAt: now
            });

            if (accountOwnershipInfos.length === 0) {
                throw new factory.errors.NotFound('accountOwnershipInfos');
            }

            // 承認アクションを開始する
            const actionAttributes: factory.action.authorize.award.pecorino.IAttributes = {
                typeOf: factory.actionType.AuthorizeAction,
                object: {
                    typeOf: factory.action.authorize.award.pecorino.ObjectType.PecorinoAward,
                    transactionId: transaction.id,
                    amount: 1
                },
                agent: transaction.seller,
                recipient: transaction.agent,
                purpose: transaction
            };
            const action = await repos.action.start(actionAttributes);

            let pecorinoEndpoint: string;

            // Pecorinoオーソリ取得
            let pecorinoTransaction: factory.action.authorize.award.pecorino.IPecorinoTransaction;

            try {
                pecorinoEndpoint = repos.depositService.options.endpoint;

                debug('starting pecorino pay transaction...', 1);
                pecorinoTransaction = await repos.depositService.start({
                    // 最大1ヵ月のオーソリ
                    expires: moment().add(1, 'month').toDate(),
                    agent: {
                        typeOf: transaction.seller.typeOf,
                        id: transaction.seller.id,
                        name: transaction.seller.name.ja,
                        url: transaction.seller.url
                    },
                    recipient: {
                        typeOf: transaction.agent.typeOf,
                        id: transaction.agent.id,
                        name: `sskts-transaction-${transaction.id}`,
                        url: transaction.agent.url
                    },
                    amount: 1,
                    notes: 'シネマサンシャイン 新規登録インセンティブ',
                    accountType: factory.accountType.Point,
                    toAccountNumber: accountOwnershipInfos[0].typeOfGood.accountNumber
                });
                debug('pecorinoTransaction started.', pecorinoTransaction.id);
            } catch (error) {
                // actionにエラー結果を追加
                try {
                    // tslint:disable-next-line:max-line-length no-single-line-block-comment
                    const actionError = { ...error, ...{ name: error.name, message: error.message } };
                    await repos.action.giveUp(action.typeOf, action.id, actionError);
                } catch (__) {
                    // 失敗したら仕方ない
                }

                error = handlePecorinoError(error);
                throw error;
            }

            // アクションを完了
            debug('ending authorize action...');
            const actionResult: factory.action.authorize.award.pecorino.IResult = {
                price: 0, // JPYとして0円
                amount: 1,
                pecorinoTransaction: pecorinoTransaction,
                pecorinoEndpoint: pecorinoEndpoint
            };

            await repos.action.complete(action.typeOf, action.id, actionResult);
        }

        // 会員プログラムオファー承認
        await PlaceOrderService.action.authorize.offer.programMembership.create({
            agentId: params.registerActionAttributes.agent.id,
            transactionId: transaction.id,
            acceptedOffer: acceptedOffer
        })(repos);

        // 会員クレジットカード検索
        // 事前にクレジットカードを登録しているはず
        const creditCards = await CreditCardService.find(customer.memberOf.membershipNumber)();
        // tslint:disable-next-line:no-suspicious-comment
        // TODO 絞る
        // creditCards = creditCards.filter((c) => c.defaultFlag === '1');
        const creditCard = creditCards.shift();
        if (creditCard === undefined) {
            throw new factory.errors.NotFound('CreditCard');
        }
        debug('creditCard found.', creditCard.cardSeq);

        // クレジットカードオーソリ
        // GMOオーダーIDは27バイト制限。十分ユニークになるようにとりあえず22バイトで作成。
        const orderId = util.format(
            'PM-%s-%s', // ProgramMembershipのオーダー
            // tslint:disable-next-line:no-magic-numbers
            `${customer.memberOf.membershipNumber}------`.slice(0, 6).toUpperCase(), // ユーザーネームの頭数文字
            moment().tz('Asia/Tokyo').format('YYMMDDhhmmss') // 秒
        );
        await PlaceOrderService.action.authorize.paymentMethod.creditCard.create({
            agentId: params.registerActionAttributes.agent.id,
            transactionId: transaction.id,
            orderId: orderId,
            amount: acceptedOffer.price,
            method: GMO.utils.util.Method.Lump,
            creditCard: {
                memberId: customer.memberOf.membershipNumber,
                cardSeq: parseInt(creditCard.cardSeq, 10)
            }
        })(repos);
        debug('creditCard authorization created.');

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if ((<factory.person.IPerson>params.registerActionAttributes.agent).memberOf === undefined) {
            throw new factory.errors.NotFound('params.agent.memberOf');
        }
        const contact = await repos.person.getUserAttributes({
            userPooId: <string>process.env.COGNITO_USER_POOL_ID,
            username: customer.memberOf.membershipNumber
        });
        await PlaceOrderService.setCustomerContact({
            agentId: params.registerActionAttributes.agent.id,
            transactionId: transaction.id,
            contact: contact
        })(repos);
        debug('customer contact set.');

        // 取引確定
        debug('confirming transaction...', transaction.id);

        return PlaceOrderService.confirm({
            agentId: params.registerActionAttributes.agent.id,
            transactionId: transaction.id,
            orderDate: new Date()
        })(repos);
    };
}
