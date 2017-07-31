/**
 * 承認ファクトリー
 *
 * @namespace factory/authorization
 */

import AuthorizationGroup from './authorizationGroup';

/**
 * 承認インターフェース
 */
export interface IAuthorization {
    /**
     * 承認ID
     */
    id: string;
    /**
     * 承認グループ
     */
    group: AuthorizationGroup;
    /**
     * 承認価格
     */
    price: number;
    /**
     * 承認対象
     */
    object: any;
    /**
     * 承認結果
     */
    result: any;
}
