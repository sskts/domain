/**
 * Pecorino承認アクションサービス
 * @namespace service.transaction.placeOrderInProgress.action.authorize.pecorino
 */

import * as pecorinoapi from '@motionpicture/pecorino-api-nodejs-client';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';

import { MongoRepository as PecorinoActionRepo } from '../../../../../repo/action/authorize/pecorino';
import { MongoRepository as TransactionRepo } from '../../../../../repo/transaction';

const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress:action:authorize:pecorino');

export type ICreateOperation<T> = (
    authorizeActionRepo: PecorinoActionRepo,
    transactionRepo: TransactionRepo,
    payTransactionService: pecorinoapi.service.transaction.Pay
) => Promise<T>;

/**
 * オーソリを取得するクレジットカード情報インターフェース
 */
export type ICreditCard4authorizeAction =
    factory.paymentMethod.paymentCard.creditCard.IUncheckedCardRaw |
    factory.paymentMethod.paymentCard.creditCard.IUncheckedCardTokenized |
    factory.paymentMethod.paymentCard.creditCard.IUnauthorizedCardOfMember;

/**
 * Pecorino残高差し押さえ
 */
export function create(
    agentId: string,
    transactionId: string,
    price: number
): ICreateOperation<factory.action.authorize.creditCard.IAction> {
    // tslint:disable-next-line:max-func-body-length
    return async (
        authorizeActionRepo: PecorinoActionRepo,
        transactionRepo: TransactionRepo,
        payTransactionService: pecorinoapi.service.transaction.Pay
    ) => {
        const transaction = await transactionRepo.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // 承認アクションを開始する
        const action = await authorizeActionRepo.start(
            transaction.agent,
            transaction.seller,
            {
                transactionId: transactionId,
                price: price
            }
        );

        // Pecorinoオーソリ取得
        let pecorinoTransaction: any;
        try {
            pecorinoTransaction = await payTransactionService.start({
                // tslint:disable-next-line:no-magic-numbers
                expires: moment().add(60, 'minutes').toDate(),
                recipient: {
                    typeOf: 'Person',
                    id: transaction.seller.id,
                    name: transaction.seller.name,
                    url: transaction.seller.url
                },
                price: price,
                notes: 'sskts-placeOrderTransaction'
            });
            debug('pecorinoTransaction started.', pecorinoTransaction.id);
        } catch (error) {
            // actionにエラー結果を追加
            try {
                const actionError = (error instanceof Error) ? { ...error, ...{ message: error.message } } : error;
                await authorizeActionRepo.giveUp(action.id, actionError);
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw new Error(error);
        }

        // アクションを完了
        debug('ending authorize action...');

        return authorizeActionRepo.complete(
            action.id,
            {
                price: price,
                pecorinoTransaction: pecorinoTransaction,
                pecorinoEndpoint: payTransactionService.options.endpoint
            }
        );
    };
}

export function cancel(
    agentId: string,
    transactionId: string,
    actionId: string
) {
    return async (__1: PecorinoActionRepo, __2: TransactionRepo) => {
        debug('canceling pecorino authorize action...', agentId, transactionId, actionId);
        debug('implementing...');
    };
}
