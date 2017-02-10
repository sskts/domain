/// <reference types="mongoose" />
import ObjectId from "../model/objectId";
import Ownership from "../model/ownership";
/**
 * 所有権ファクトリー
 *
 * @namespace
 */
declare namespace OwnershipFactory {
    function create(args: {
        _id?: ObjectId;
        owner: ObjectId;
        authenticated: boolean;
    }): Ownership;
}
export default OwnershipFactory;
