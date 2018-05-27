/**
 * 会員プログラムサービス
 */
import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';

import * as CreditCardService from './person/creditCard';
import * as PlaceOrderService from './transaction/placeOrderInProgress';

import { MongoRepository as ActionRepo } from '../repo/action';
import { MongoRepository as OrganizationRepo } from '../repo/organization';
import { CognitoRepository as PersonRepo } from '../repo/person';
import { MongoRepository as ProgramMembershipRepo } from '../repo/programMembership';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

const debug = createDebug('sskts-domain:service:programMembership');

export type IStartRegisterOperation<T> = (repos: {
    organization: OrganizationRepo;
    programMembership: ProgramMembershipRepo;
    task: TaskRepo;
    transaction: TransactionRepo;
}) => Promise<T>;

export type IRegisterOperation<T> = (repos: {
    action: ActionRepo;
    organization: OrganizationRepo;
    person: PersonRepo;
    programMembership: ProgramMembershipRepo;
    transaction: TransactionRepo;
}) => Promise<T>;

/**
 * 会員登録タスクを作成する
 */
export function createRegisterTask(params: {
    /**
     * 会員のユーザーID(CognitoのUserId)
     */
    userId: string;
    /**
     * Cognitoユーザーネーム
     */
    username: string;
    /**
     * CognitoユーザープールID
     */
    userPoolId: string;
    /**
     * 会員プログラムID
     */
    programMembershipId: string;
    /**
     * 会員プログラムのオファー識別子
     */
    offerIdentifier: string;
    /**
     * 販売者タイプ
     * どの販売者に属した会員プログラムを登録するか
     */
    sellerType: factory.organizationType;
    /**
     * 販売者ID
     * どの販売者に属した会員プログラムを登録するか
     */
    sellerId: string;
}): IStartRegisterOperation<factory.task.ITask> {
    return async (repos: {
        organization: OrganizationRepo;
        programMembership: ProgramMembershipRepo;
        task: TaskRepo;
        transaction: TransactionRepo;
    }) => {
        const now = new Date();
        const programMemberships = await repos.programMembership.search({ id: params.programMembershipId });
        const programMembership = programMemberships.shift();
        if (programMembership === undefined) {
            throw new factory.errors.NotFound('ProgramMembership');
        }
        if (programMembership.offers === undefined) {
            throw new factory.errors.NotFound('ProgramMembership.offers');
        }
        const offer = programMembership.offers.find((o) => o.identifier === params.offerIdentifier);
        if (offer === undefined) {
            throw new factory.errors.NotFound('Offer');
        }
        const seller = await repos.organization.findById(params.sellerType, params.sellerId);
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
            agent: {
                typeOf: factory.personType.Person,
                id: params.userId,
                username: params.username,
                userPoolId: params.userPoolId
            },
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

        return repos.task.save(taskAttributes);
    };
}

/**
 * 会員プログラム登録
 */
export function register(
    params: factory.action.interact.register.programMembership.IAttributes
): IRegisterOperation<factory.action.interact.register.programMembership.IAction> {
    return async (repos: {
        action: ActionRepo;
        organization: OrganizationRepo;
        person: PersonRepo;
        programMembership: ProgramMembershipRepo;
        transaction: TransactionRepo;
    }) => {
        // tslint:disable-next-line:no-suspicious-comment
        // TODO 登録ロック

        // アクション開始
        const action = await repos.action.start(params);

        let order: factory.order.IOrder;
        try {
            order = await processPlaceOrder(params)(repos);
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
        const actionResult: factory.action.interact.register.programMembership.IResult = {
            order: order
        };

        return repos.action.complete(action.typeOf, action.id, actionResult);
    };
}

/**
 * 会員プログラム登録解除
 */
export function unRegister(_: factory.action.interact.unRegister.IAttributes) {
    return async (__: {
    }) => {
        // tslint:disable-next-line:no-suspicious-comment
        // TODO 実装
    };
}

/**
 * 会員プログラム登録アクション属性から、会員プログラムを注文する
 */
function processPlaceOrder(params: factory.action.interact.register.programMembership.IAttributes) {
    return async (repos: {
        action: ActionRepo;
        organization: OrganizationRepo;
        person: PersonRepo;
        programMembership: ProgramMembershipRepo;
        transaction: TransactionRepo;
    }) => {
        const programMembership = params.object.itemOffered;
        if (programMembership.offers === undefined) {
            throw new factory.errors.NotFound('ProgramMembership.offers');
        }
        const acceptedOffer = params.object;
        const seller = programMembership.hostingOrganization;
        if (seller === undefined) {
            throw new factory.errors.NotFound('ProgramMembership.hostingOrganization');
        }

        // 会員プログラム注文取引進行
        // 会員プログラム更新タスク作成は、注文後のアクションに定義すればよいか
        const transaction = await PlaceOrderService.start({
            // tslint:disable-next-line:no-magic-numbers
            expires: moment().add(5, 'minutes').toDate(),
            agentId: params.agent.id,
            sellerId: seller.id,
            clientUser: <any>{}
            // passportToken:
        })(repos);
        debug('transaction started', transaction.id);

        // 会員プログラムオファー承認
        await PlaceOrderService.action.authorize.offer.programMembership.create({
            agentId: params.agent.id,
            transactionId: transaction.id,
            acceptedOffer: acceptedOffer
        })(repos);

        // 会員クレジットカード検索
        // 事前にクレジットカードを登録しているはず
        const creditCards = await CreditCardService.find(params.agent.id, '')();
        // tslint:disable-next-line:no-suspicious-comment
        // TODO 絞る
        // creditCards = creditCards.filter((c) => c.defaultFlag === '1');
        const creditCard = creditCards.shift();
        if (creditCard === undefined) {
            throw new factory.errors.NotFound('CreditCard');
        }
        debug('creditCard found.', creditCard.cardSeq);

        // クレジットカードオーソリ
        await PlaceOrderService.action.authorize.paymentMethod.creditCard.create({
            agentId: params.agent.id,
            transactionId: transaction.id,
            orderId: moment().valueOf().toString(),
            amount: acceptedOffer.price,
            method: GMO.utils.util.Method.Lump,
            creditCard: {
                memberId: params.agent.id,
                cardSeq: parseInt(creditCard.cardSeq, 10)
            }
        })(repos);
        debug('creditCard authorization created.');

        if (params.agent.userPoolId === undefined) {
            throw new factory.errors.NotFound('params.agent.userPoolId');
        }
        if (params.agent.username === undefined) {
            throw new factory.errors.NotFound('params.agent.username');
        }
        const contact = await repos.person.getUserAttributes({
            userPooId: params.agent.userPoolId,
            username: params.agent.username
        });
        await PlaceOrderService.setCustomerContact({
            agentId: params.agent.id,
            transactionId: transaction.id,
            contact: contact
        })(repos);
        debug('customer contact set.');

        // 取引確定
        debug('confirming transaction...', transaction.id);

        return PlaceOrderService.confirm({
            agentId: params.agent.id,
            transactionId: transaction.id
        })(repos);
    };
}
