/**
 * 会員プログラムサービス
 */
import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';

// import * as ContactService from './person/contact';
import * as CreditCardService from './person/creditCard';
import * as PlaceOrderService from './transaction/placeOrderInProgress';

import { MongoRepository as ActionRepo } from '../repo/action';
import { MongoRepository as OrganizationRepo } from '../repo/organization';
import { MongoRepository as ProgramMembershipRepo } from '../repo/programMembership';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

const debug = createDebug('sskts-domain:service:programMembership');

export type IRegisterOperation<T> = (repos: {
    action: ActionRepo;
    organization: OrganizationRepo;
    programMembership: ProgramMembershipRepo;
    transaction: TransactionRepo;
}) => Promise<T>;

/**
 * 会員プログラム登録
 */
export function register(
    params: factory.action.interact.register.programMembership.IAttributes
): IRegisterOperation<factory.action.interact.register.programMembership.IAction> {
    return async (repos: {
        action: ActionRepo;
        organization: OrganizationRepo;
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

        await PlaceOrderService.setCustomerContact({
            agentId: params.agent.id,
            transactionId: transaction.id,
            contact: {
                givenName: '',
                familyName: '',
                telephone: '+819012345678',
                email: ''
            }
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
