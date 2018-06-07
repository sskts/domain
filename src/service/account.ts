/**
 * ポイント口座サービス
 * 口座の保管先はPecorinoサービスです。
 */
import * as pecorinoapi from '@motionpicture/pecorino-api-nodejs-client';
import * as factory from '@motionpicture/sskts-factory';
// import * as createDebug from 'debug';
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, TOO_MANY_REQUESTS, UNAUTHORIZED } from 'http-status';
import * as moment from 'moment';

import { RedisRepository as AccountNumberRepo } from '../repo/accountNumber';

// const debug = createDebug('sskts-domain:service:account');

/**
 * ポイント口座を開設する
 */
export function open(params: {
    name: string;
}) {
    return async (repos: {
        /**
         * 口座番号リポジトリー
         */
        accountNumber: AccountNumberRepo;
        /**
         * Pecorino口座サービス
         */
        accountService: pecorinoapi.service.Account;
    }) => {
        const accountNumber = await repos.accountNumber.publish(new Date());

        return repos.accountService.open({
            accountNumber: accountNumber,
            name: params.name
        });
    };
}

/**
 * 入金処理を実行する
 */
export function deposit(params: {
    agent: {
        id: string;
        name: string;
        url: string;
    };
    recipient: {
        id: string;
        name: string;
        url: string;
    };
    /**
     * 入金先口座番号
     */
    toAccountNumber: string;
    /**
     * 入金金額
     */
    amount: number;
    /**
     * 入金説明
     */
    notes: string;
}) {
    return async (repos: {
        /**
         * Pecorino入金サービス
         */
        depositService: pecorinoapi.service.transaction.Deposit;
    }) => {
        try {
            const transaction = await repos.depositService.start({
                toAccountNumber: params.toAccountNumber,
                expires: moment().add(1, 'minutes').toDate(),
                agent: {
                    typeOf: factory.personType.Person,
                    id: params.agent.id,
                    name: params.agent.name,
                    url: params.agent.url
                },
                recipient: {
                    typeOf: factory.personType.Person,
                    id: params.recipient.id,
                    name: params.recipient.name,
                    url: params.recipient.url
                },
                amount: params.amount,
                notes: params.notes
            });
            await repos.depositService.confirm({ transactionId: transaction.id });
        } catch (error) {
            error = handlePecorinoError(error);
            throw error;
        }
    };
}

/**
 * Pecorinoサービスエラーをハンドリングして本ドメインのエラーに変換する
 */
export function handlePecorinoError(error: any) {
    let handledError: Error = error;

    // PecorinoAPIのレスポンスステータスコードが4xxであればクライアントエラー
    if (error.name === 'PecorinoRequestError') {
        // Pecorino APIのステータスコード4xxをハンドリング
        const message = `${error.name}:${error.message}`;
        switch (error.code) {
            case BAD_REQUEST: // 400
                handledError = new factory.errors.Argument('PecorinoArgument', message);
                break;
            case UNAUTHORIZED: // 401
                handledError = new factory.errors.Unauthorized(message);
                break;
            case FORBIDDEN: // 403
                handledError = new factory.errors.Forbidden(message);
                break;
            case NOT_FOUND: // 404
                handledError = new factory.errors.NotFound(message);
                break;
            case TOO_MANY_REQUESTS: // 429
                handledError = new factory.errors.RateLimitExceeded(message);
                break;
            default:
                handledError = new factory.errors.ServiceUnavailable(message);
        }
    }

    return handledError;
}
