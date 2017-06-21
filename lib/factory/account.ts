/**
 * 口座ファクトリー
 *
 * @namespace factory/account
 */

import AccountStatus from './accountStatus';

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
     * @type {AccountStatus}
     * @memberof IAccount
     */
    status: AccountStatus;
}
