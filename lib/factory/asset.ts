/**
 * 資産ファクトリー
 *
 * @namespace AssetFactory
 */
import AssetGroup from './assetGroup';
import * as AuthorizationFactory from './authorization';
import * as OwnershipFactory from './ownership';

/**
 * 資産インターフェース
 *
 * @export
 * @interface IAsset
 *
 * @param {string} id
 * @param {AssetGroup} group 資産グループ
 * @param {Ownership} ownership 所有権
 * @param {number} price 価格
 * @param {Array<Authorization>} authorizations 承認リスト
 */
export interface IAsset {
    id: string;
    group: AssetGroup;
    ownership: OwnershipFactory.IOwnership;
    price: number;
    authorizations: AuthorizationFactory.IAuthorization[];
}
