/// <reference types="mongoose" />
import ObjectId from "../model/objectId";
/**
 * オブジェクトIDファクトリー
 *
 * @namespace ObjectIdFactory
 */
declare namespace ObjectIdFactory {
    /**
     * オブジェクトIDを作成する
     *
     * @export
     * @returns {ObjectId}
     *
     * @memberof ObjectIdFactory
     */
    function create(id: string): ObjectId;
}
export default ObjectIdFactory;
