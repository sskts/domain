/**
 * 口座ファクトリー
 *
 * @namespace factory/account
 */

import AcountStatus from './accountStatus';

/**
 * 口座インターフェース
 *
 * @interface IAccount
 * @memberof factory/account
 */
export interface IAccount {
    /**
     * 口座ID
     *
     * @type {string}
     * @memberof IAccount
     */
    id: string;
    /**
     * 口座ステータス
     *
     * @type {AcountStatus}
     * @memberof IAccount
     */
    status: AcountStatus;
}
