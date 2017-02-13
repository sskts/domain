/// <reference types="mongoose" />
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
export declare function create(id: string): ObjectId;
