/**
 * Pecorino承認アクションサービス
 * @namespace service.transaction.placeOrderInProgress.action.authorize.pecorino
 */

import * as pecorinoapi from '@motionpicture/pecorino-api-nodejs-client';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';

import { MongoRepository as ActionRepo } from '../../../../../repo/action';
import { MongoRepository as TransactionRepo } from '../../../../../repo/transaction';

const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress:action:authorize:pecorino');

export namespace AuthorizeActionFactory {
    export type IAgent = any;
    export type IRecipient = any;
    export interface IObject {
        transactionId: string;
        price: number;
    }
    export type IAction = any;
    export interface IResult {
        price: number;
        pecorinoTransaction: any;
        pecorinoEndpoint: string;
    }

    export function createAttributes(params: {
        actionStatus: factory.actionStatusType;
        result?: IResult;
        object: IObject;
        agent: IAgent;
        recipient: IRecipient;
        startDate: Date;
        endDate?: Date;
    }) {
        return {
            actionStatus: params.actionStatus,
            typeOf: factory.actionType.AuthorizeAction,
            purpose: {
                typeOf: 'Pecorino'
            },
            result: params.result,
            object: params.object,
            agent: params.agent,
            recipient: params.recipient,
            startDate: params.startDate,
            endDate: params.endDate
        };
    }
}

export type ICreateOperation<T> = (
    actionRepo: ActionRepo,
    transactionRepo: TransactionRepo,
    payTransactionService: pecorinoapi.service.transaction.Pay
) => Promise<T>;

/**
 * Pecorino残高差し押さえ
 */
export function create(
    agentId: string,
    transactionId: string,
    price: number
): ICreateOperation<factory.action.authorize.IAction<any>> {
    // tslint:disable-next-line:max-func-body-length
    return async (
        actionRepo: ActionRepo,
        transactionRepo: TransactionRepo,
        payTransactionService: pecorinoapi.service.transaction.Pay
    ) => {
        const transaction = await transactionRepo.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // 承認アクションを開始する
        const action = await actionRepo.start({
            typeOf: factory.actionType.AuthorizeAction,
            agent: transaction.agent,
            object: {
                typeOf: 'Pecorino',
                transactionId: transactionId,
                price: price
            },
            recipient: transaction.seller,
            purpose: transaction
        });

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
                await actionRepo.giveUp(action.typeOf, action.id, actionError);
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw new Error(error);
        }

        // アクションを完了
        debug('ending authorize action...');

        return actionRepo.complete(
            action.typeOf,
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
    return async (__1: ActionRepo, __2: TransactionRepo) => {
        debug('canceling pecorino authorize action...', agentId, transactionId, actionId);
        debug('implementing...');
    };
}
