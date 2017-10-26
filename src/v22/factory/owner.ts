/**
 * 所有者ファクトリー
 *
 * @namespace factory/owner
 */

import OwnerGroup from './ownerGroup';

/**
 * 所有者インターフェース
 *
 * @interface IOwner
 * @param {string} id
 * @param {OwnerGroup} group 所有者グループ
 * @memberof factory/owner
 */
export interface IOwner {
    id: string;
    group: OwnerGroup;
}
