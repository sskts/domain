import ObjectId from "../model/objectId";

/**
 * オブジェクトIDファクトリー
 *
 * @namespace ObjectIdFactory
 */
namespace ObjectIdFactory {
    /**
     * オブジェクトIDを作成する
     *
     * @export
     * @returns {ObjectId}
     *
     * @memberof ObjectIdFactory
     */
    export function create(id: string): ObjectId {
        return ObjectId(id);
    }
}

export default ObjectIdFactory;