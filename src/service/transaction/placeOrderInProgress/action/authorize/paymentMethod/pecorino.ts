/**
 * Pecorino決済承認アクションサービス
 */
import * as pecorinoapi from '@motionpicture/pecorino-api-nodejs-client';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, TOO_MANY_REQUESTS, UNAUTHORIZED } from 'http-status';
import * as moment from 'moment';

import { MongoRepository as ActionRepo } from '../../../../../../repo/action';
import { MongoRepository as OrganizationRepo } from '../../../../../../repo/organization';
import { MongoRepository as OwnershipInfoRepo } from '../../../../../../repo/ownershipInfo';
import { MongoRepository as TransactionRepo } from '../../../../../../repo/transaction';

const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress:action:authorize:pecorino');

export type ICreateOperation<T> = (repos: {
    action: ActionRepo;
    organization: OrganizationRepo;
    ownershipInfo: OwnershipInfoRepo;
    transaction: TransactionRepo;
    withdrawTransactionService?: pecorinoapi.service.transaction.Withdraw;
    transferTransactionService?: pecorinoapi.service.transaction.Transfer;
}) => Promise<T>;

/**
 * Pecorino残高差し押さえ
 * 口座取引は、出金取引あるいは転送取引のどちらかを選択できます。
 */
export function create(params: {
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * 金額
     */
    amount: number;
    /**
     * Pecorino口座ID
     */
    fromAccountNumber: string;
    /**
     * 出金取引メモ
     */
    notes?: string;
}): ICreateOperation<factory.action.authorize.paymentMethod.pecorino.IAction> {
    // tslint:disable-next-line:max-func-body-length
    return async (repos: {
        action: ActionRepo;
        organization: OrganizationRepo;
        ownershipInfo: OwnershipInfoRepo;
        transaction: TransactionRepo;
        /**
         * 出金取引サービス
         */
        withdrawTransactionService?: pecorinoapi.service.transaction.Withdraw;
        /**
         * 転送取引サービス
         */
        transferTransactionService?: pecorinoapi.service.transaction.Transfer;
    }) => {
        const transaction = await repos.transaction.findInProgressById(factory.transactionType.PlaceOrder, params.transactionId);

        // 他者口座による決済も可能にするためにコメントアウト
        // 基本的に、自分の口座のオーソリを他者に与えても得しないので、
        // これが問題になるとすれば、本当にただサービスを荒らしたい悪質な攻撃のみ、ではある
        // if (transaction.agent.id !== agentId) {
        //     throw new factory.errors.Forbidden('A specified transaction is not yours.');
        // }

        // インセンティブ付与可能条件は、会員プログラム特典に加入しているかどうか
        if (transaction.agent.memberOf === undefined) {
            throw new factory.errors.Forbidden('Membership required');
        }
        const programMemberships = await repos.ownershipInfo.search({
            goodType: 'ProgramMembership',
            ownedBy: transaction.agent.memberOf.membershipNumber,
            ownedAt: new Date()
        });
        const pecorinoPaymentAward = programMemberships.reduce((a, b) => [...a, ...b.typeOfGood.award], [])
            .find((a) => a === factory.programMembership.Award.PecorinoPayment);
        if (pecorinoPaymentAward === undefined) {
            throw new factory.errors.Forbidden('Membership program requirements not satisfied');
        }

        // 承認アクションを開始する
        const actionAttributes: factory.action.authorize.paymentMethod.pecorino.IAttributes = {
            typeOf: factory.actionType.AuthorizeAction,
            object: {
                typeOf: factory.action.authorize.paymentMethod.pecorino.ObjectType.PecorinoPayment,
                transactionId: params.transactionId,
                amount: params.amount
            },
            agent: transaction.agent,
            recipient: transaction.seller,
            purpose: transaction
        };
        const action = await repos.action.start(actionAttributes);

        let pecorinoEndpoint: string;

        // Pecorinoオーソリ取得
        type IPecorinoTransaction = pecorinoapi.factory.transaction.withdraw.ITransaction |
            pecorinoapi.factory.transaction.transfer.ITransaction;
        let pecorinoTransaction: IPecorinoTransaction;

        try {
            if (repos.withdrawTransactionService !== undefined) {
                pecorinoEndpoint = repos.withdrawTransactionService.options.endpoint;

                debug('starting pecorino pay transaction...', params.amount);
                pecorinoTransaction = await repos.withdrawTransactionService.start({
                    // 最大1ヵ月のオーソリ
                    expires: moment().add(1, 'month').toDate(),
                    agent: {
                        name: `sskts-transaction-${transaction.id}`
                    },
                    recipient: {
                        typeOf: 'Person',
                        id: transaction.seller.id,
                        name: transaction.seller.name.ja,
                        url: (transaction.seller.url !== undefined) ? transaction.seller.url : ''
                    },
                    amount: params.amount,
                    notes: (params.notes !== undefined) ? params.notes : 'シネマサンシャイン 注文取引',
                    fromAccountNumber: params.fromAccountNumber
                });
                debug('pecorinoTransaction started.', pecorinoTransaction.id);
            } else if (repos.transferTransactionService !== undefined) {
                pecorinoEndpoint = repos.transferTransactionService.options.endpoint;

                // 組織から転送先口座IDを取得する
                const seller = await repos.organization.findById(transaction.seller.typeOf, transaction.seller.id);
                if (seller.paymentAccepted === undefined) {
                    throw new factory.errors.Argument('transactionId', 'Pecorino payment not accepted.');
                }
                const pecorinoPaymentAccepted = <factory.organization.IPaymentAccepted<factory.paymentMethodType.Pecorino>>
                    seller.paymentAccepted.find(
                        (a) => a.paymentMethodType === factory.paymentMethodType.Pecorino
                    );
                if (pecorinoPaymentAccepted === undefined) {
                    throw new factory.errors.Argument('transactionId', 'Pecorino payment not accepted.');
                }

                debug('starting pecorino pay transaction...', params.amount);
                pecorinoTransaction = await repos.transferTransactionService.start({
                    // 最大1ヵ月のオーソリ
                    expires: moment().add(1, 'month').toDate(),
                    agent: {
                        name: `sskts-transaction-${transaction.id}`
                    },
                    recipient: {
                        typeOf: 'Person',
                        id: transaction.seller.id,
                        name: transaction.seller.name.ja,
                        url: (transaction.seller.url !== undefined) ? transaction.seller.url : ''
                    },
                    amount: params.amount,
                    notes: (params.notes !== undefined) ? params.notes : 'シネマサンシャイン 注文取引',
                    fromAccountNumber: params.fromAccountNumber,
                    toAccountNumber: pecorinoPaymentAccepted.accountNumber
                });
                debug('pecorinoTransaction started.', pecorinoTransaction.id);
            } else {
                throw new factory.errors.Argument('resos', 'withdrawTransactionService or transferTransactionService required.');
            }
        } catch (error) {
            // actionにエラー結果を追加
            try {
                // tslint:disable-next-line:max-line-length no-single-line-block-comment
                const actionError = { ...error, ...{ name: error.name, message: error.message } };
                await repos.action.giveUp(action.typeOf, action.id, actionError);
            } catch (__) {
                // 失敗したら仕方ない
            }

            // PecorinoAPIのレスポンスステータスコードが4xxであればクライアントエラー
            if (error.name === 'PecorinoRequestError') {
                // Pecorino APIのステータスコード4xxをハンドリング
                const message = `${error.name}:${error.message}`;
                switch (error.code) {
                    case BAD_REQUEST: // 400
                        throw new factory.errors.Argument('fromAccountNumber', message);
                    case UNAUTHORIZED: // 401
                        throw new factory.errors.Unauthorized(message);
                    case FORBIDDEN: // 403
                        throw new factory.errors.Forbidden(message);
                    case NOT_FOUND: // 404
                        throw new factory.errors.NotFound(message);
                    case TOO_MANY_REQUESTS: // 429
                        throw new factory.errors.RateLimitExceeded(message);
                    default:
                        throw new factory.errors.ServiceUnavailable(message);
                }
            }

            throw error;
        }

        // アクションを完了
        debug('ending authorize action...');
        const actionResult: factory.action.authorize.paymentMethod.pecorino.IResult = {
            price: 0, // JPYとして0円
            amount: params.amount,
            pecorinoTransaction: pecorinoTransaction,
            pecorinoEndpoint: pecorinoEndpoint
        };

        return repos.action.complete(action.typeOf, action.id, actionResult);
    };
}

/**
 * Pecorino承認を取り消す
 */
export function cancel(params: {
    /**
     * 取引進行者ID
     */
    agentId: string;
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * 承認アクションID
     */
    actionId: string;
}) {
    return async (repos: {
        action: ActionRepo;
        transaction: TransactionRepo;
        withdrawTransactionService?: pecorinoapi.service.transaction.Withdraw;
        transferTransactionService?: pecorinoapi.service.transaction.Transfer;
    }) => {
        debug('canceling pecorino authorize action...');
        const transaction = await repos.transaction.findInProgressById(factory.transactionType.PlaceOrder, params.transactionId);

        if (transaction.agent.id !== params.agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // まずアクションをキャンセル
        const action = await repos.action.cancel(factory.actionType.AuthorizeAction, params.actionId);
        const actionResult = <factory.action.authorize.paymentMethod.pecorino.IResult>action.result;

        // Pecorinoで取消中止実行
        if (repos.withdrawTransactionService !== undefined) {
            await repos.withdrawTransactionService.cancel({
                transactionId: actionResult.pecorinoTransaction.id
            });
        } else if (repos.transferTransactionService !== undefined) {
            await repos.transferTransactionService.cancel({
                transactionId: actionResult.pecorinoTransaction.id
            });
        } else {
            throw new factory.errors.Argument('resos', 'withdrawTransactionService or transferTransactionService required.');
        }
    };
}
