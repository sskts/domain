/**
 * アプリケーションクライアントファクトリー
 * チケッティングweb、スマホアプリなど、ssktsのapiを使用するアプリケーションクライアントを生成する
 *
 * @namespace factory/client
 */

import IMultilingualString from './multilingualString';

/**
 * アプリケーションクライアントインターフェース
 *
 * @interface IClient
 *
 * @param {string} id
 * @param {string} secret_salt シークレットソルト
 * @param {string} secret_hash シークレットハッシュ
 * @param {IMultilingualString} name 名称
 * @param {IMultilingualString} description 説明
 * @param {IMultilingualString} notes 備考
 * @param {string} email メールアドレス
 *
 * @memberof factory/client
 */
export interface IClient {
    /**
     * ID
     */
    id: string;
    /**
     * シークレットハッシュ
     */
    secret_hash: string;
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
 * クライアントを生成する
 *
 * @returns {IClient} クライアントオブジェクト
 *
 * @memberof factory/client
 */
export function create(args: {
    /**
     * ID
     */
    id: string;
    /**
     * シークレットハッシュ
     */
    secret_hash: string;
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
}): IClient {
    // todo validation

    return {
        id: args.id,
        secret_hash: args.secret_hash,
        name: args.name,
        description: args.description,
        notes: args.notes,
        email: args.email
    };
}
