/**
 * 承認ファクトリー
 *
 * 誰が、誰に対して、何の所有を、承認するのか
 * 何の所有を、というのは承認グループによって異なる
 *
 * @namespace AuthorizationFactory
 */
import AuthorizationGroup from './authorizationGroup';

/**
 * 承認インターフェース
 *
 * @export
 * @interface IAuthorization
 * @param {string} id
 * @param {Asset} asset 資産
 * @param {number} price 資産価格
 * @param {string} owner_from 誰が
 * @param {string} owner_to 誰に対して
 */
export interface IAuthorization {
    id: string;
    group: AuthorizationGroup;
    price: number;
    owner_from: string;
    owner_to: string;
}

// 後に何かmemberが増えるかもしれない
// export interface IAssetAuthorization extends IAuthorization { // tslint:disable-line:no-empty-interface no-empty-interfaces
// }
