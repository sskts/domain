/**
 * 会員プログラム承認アクションサービス
 */
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import { MongoRepository as ActionRepo } from '../../../../../../repo/action';
import { MongoRepository as OrganizationRepo } from '../../../../../../repo/organization';
import { MongoRepository as ProgramMembershipRepo } from '../../../../../../repo/programMembership';
import { MongoRepository as TransactionRepo } from '../../../../../../repo/transaction';

const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress:action:authorize:offer:eventReservation:menuItem');

export type ICreateOperation<T> = (repos: {
    action: ActionRepo;
    organization: OrganizationRepo;
    programMembership: ProgramMembershipRepo;
    transaction: TransactionRepo;
}) => Promise<T>;

export function create(params: {
    agentId: string;
    transactionId: string;
    programMembershipId: string;
    offerIdentifier: string;
}): ICreateOperation<any> {
    return async (repos: {
        action: ActionRepo;
        organization: OrganizationRepo;
        programMembership: ProgramMembershipRepo;
        transaction: TransactionRepo;
    }) => {
        const transaction = await repos.transaction.findInProgressById(factory.transactionType.PlaceOrder, params.transactionId);

        if (transaction.agent.id !== params.agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // 会員プログラム検索
        const programMemberships = await repos.programMembership.search({ id: params.programMembershipId });
        const programMembership = programMemberships.shift();
        if (programMembership === undefined) {
            throw new factory.errors.NotFound('ProgramMembership');
        }
        if (programMembership.offers === undefined) {
            throw new factory.errors.NotFound('ProgramMembership.Offer');
        }
        const acceptedOffer = programMembership.offers.find((o) => o.identifier === params.offerIdentifier);
        if (acceptedOffer === undefined) {
            throw new factory.errors.NotFound('Offer');
        }

        // 在庫確認は現時点で不要
        // 何かしら会員プログラムへの登録に制約を設けたい場合は、ここに処理を追加するとよいかと思われます。

        // 承認アクションを開始
        debug('starting authorize action of programMembership...', params.programMembershipId, params.offerIdentifier);
        const actionAttributes: any = {
            typeOf: factory.actionType.AuthorizeAction,
            object: {
                typeOf: acceptedOffer.typeOf,
                price: acceptedOffer.price,
                priceCurrency: acceptedOffer.priceCurrency,
                itemOffered: programMembership
            },
            agent: transaction.seller,
            recipient: transaction.agent,
            purpose: transaction
        };
        const action = await repos.action.start(actionAttributes);

        try {
            // 在庫確保？
        } catch (error) {
            // actionにエラー結果を追加
            try {
                const actionError = (error instanceof Error) ? { ...error, ...{ message: error.message } } : error;
                await repos.action.giveUp(action.typeOf, action.id, actionError);
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw new factory.errors.ServiceUnavailable('Unexepected error occurred.');
        }

        // アクションを完了
        debug('ending authorize action...');
        const result: any = {
            price: acceptedOffer.price,
            priceCurrency: acceptedOffer.priceCurrency
        };

        return repos.action.complete(action.typeOf, action.id, result);
    };
}

/**
 * 承認アクションをキャンセルする
 * @param agentId アクション主体ID
 * @param transactionId 取引ID
 * @param actionId アクションID
 */
export function cancel(params: {
    agentId: string;
    transactionId: string;
    actionId: string;
}) {
    return async (repos: {
        action: ActionRepo;
        transaction: TransactionRepo;
    }) => {
        const transaction = await repos.transaction.findInProgressById(factory.transactionType.PlaceOrder, params.transactionId);

        if (transaction.agent.id !== params.agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        const action = await repos.action.cancel(factory.actionType.AuthorizeAction, params.actionId);
        debug('action canceld.', action.id);
    };
}
