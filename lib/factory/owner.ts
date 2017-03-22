/**
 * 所有者ファクトリー
 *
 * @namespace OwnerFactory
 */
import OwnerGroup from './ownerGroup';

/**
 * 所有者インターフェース
 *
 * @export
 * @interface IOwner
 * @param {string} id
 * @param {OwnerGroup} group 所有者グループ
 */
export interface IOwner {
    id: string;
    group: OwnerGroup;
}
