/// <reference types="mongoose" />
/**
 * 所有権ファクトリー
 *
 * @namespace OwnershipFactory
 */
import ObjectId from "../model/objectId";
import Ownership from "../model/ownership";
export declare function create(args: {
    _id?: ObjectId;
    owner: ObjectId;
    authenticated: boolean;
}): Ownership;
