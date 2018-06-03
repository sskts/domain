import * as pecorinoapi from '@motionpicture/pecorino-api-nodejs-client';
import * as factory from '@motionpicture/sskts-factory';
// import * as createDebug from 'debug';
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, TOO_MANY_REQUESTS, UNAUTHORIZED } from 'http-status';
import * as moment from 'moment';

// const debug = createDebug('sskts-domain:repository:account');

/**
 * ポイント口座リポジトリー
 * 口座の保管先はPecorinoサービスです。
 */
export class PecorinoRepository {
    /**
     * PecorinoAPIエンドポイント
     */
    public readonly endpoint: string;
    /**
     * PecorinoAPI認証クライアント
     */
    public readonly authClient: pecorinoapi.auth.ClientCredentials;

    constructor(params: {
        endpoint: string;
        authClient: pecorinoapi.auth.ClientCredentials;
    }) {
        this.endpoint = params.endpoint;
        this.authClient = params.authClient;
    }

    /**
     * 入金処理を実行する
     */
    public async deposit(params: {
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
        try {
            const depositService = new pecorinoapi.service.transaction.Deposit({
                endpoint: this.endpoint,
                auth: this.authClient
            });
            const transaction = await depositService.start({
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
            await depositService.confirm({ transactionId: transaction.id });
        } catch (error) {
            // PecorinoAPIのレスポンスステータスコードが4xxであればクライアントエラー
            if (error.name === 'PecorinoRequestError') {
                // Pecorino APIのステータスコード4xxをハンドリング
                const message = `${error.name}:${error.message}`;
                switch (error.code) {
                    case BAD_REQUEST: // 400
                        error = new factory.errors.Argument('PecorinoArgument', message);
                        break;
                    case UNAUTHORIZED: // 401
                        error = new factory.errors.Unauthorized(message);
                        break;
                    case FORBIDDEN: // 403
                        error = new factory.errors.Forbidden(message);
                        break;
                    case NOT_FOUND: // 404
                        error = new factory.errors.NotFound(message);
                        break;
                    case TOO_MANY_REQUESTS: // 429
                        error = new factory.errors.RateLimitExceeded(message);
                        break;
                    default:
                        error = new factory.errors.ServiceUnavailable(message);
                }
            }

            throw error;
        }
    }
}
