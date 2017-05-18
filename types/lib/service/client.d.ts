import ClientAdapter from '../adapter/client';
import IMultilingualString from '../factory/multilingualString';
export declare type ClientOperation<T> = (clientAdapter: ClientAdapter) => Promise<T>;
export interface ICreateArgs {
    /**
     * ID
     */
    id: string;
    /**
     * シークレット
     */
    secret: string;
    /**
     * 名称
     */
    name: IMultilingualString;
    /**
     * 説明
     */
    description: IMultilingualString;
    /**
     * 備考
     */
    notes: IMultilingualString;
    /**
     * メールアドレス
     */
    email: string;
}
/**
 * クライアントを更新する
 *
 * @param {clientFactory.IClient} args クライアントインターフェース
 * @returns {ClientOperation<void>} クライアントアダプターを使った操作
 */
export declare function create(args: ICreateArgs): ClientOperation<void>;
export interface IPushEventArgs {
    client: string;
    occurred_at: Date;
    url?: string;
    label: string;
    category?: string;
    action?: string;
    message?: string;
    notes?: string;
    useragent?: string;
    location?: number[];
    transaction?: string;
}
export declare function pushEvent(args: IPushEventArgs): ClientOperation<void>;
