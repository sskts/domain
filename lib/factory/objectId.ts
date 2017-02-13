/**
 * オブジェクトIDファクトリー
 *
 * @namespace ObjectIdFactory
 */

import ObjectId from '../model/objectId';

/**
 * オブジェクトIDを作成する
 *
 *
 * @returns {ObjectId}
 *
 * @memberof ObjectIdFactory
 */
export function create(id: string): ObjectId {
    return ObjectId(id);
}
