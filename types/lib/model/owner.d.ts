/// <reference types="mongoose" />
import MultilingualString from '../model/multilingualString';
import ObjectId from './objectId';
import OwnerGroup from './ownerGroup';
/**
 * 所有者
 *
 * @class Owner
 *
 * @param {ObjectId} _id
 * @param {OwnerGroup} group 所有者グループ
 */
declare class Owner {
    readonly _id: ObjectId;
    readonly group: OwnerGroup;
    constructor(_id: ObjectId, group: OwnerGroup);
}
declare namespace Owner {
    /**
     * 匿名所有者
     *
     *
     * @class AnonymousOwner
     * @extends {Owner}
     */
    class AnonymousOwner extends Owner {
        readonly _id: ObjectId;
        readonly name_first: string;
        readonly name_last: string;
        readonly email: string;
        readonly tel: string;
        /**
         * Creates an instance of AnonymousOwner.
         *
         * @param {ObjectId} _id
         * @param {string} name_first
         * @param {string} name_last
         * @param {string} email
         * @param {string} tel
         *
         * @memberOf AnonymousOwner
         */
        constructor(_id: ObjectId, name_first: string, name_last: string, email: string, tel: string);
    }
    /**
     * 興行所有者
     *
     *
     * @class PromoterOwner
     * @extends {Owner}
     */
    class PromoterOwner extends Owner {
        readonly _id: ObjectId;
        readonly name: MultilingualString;
        /**
         * Creates an instance of PromoterOwner.
         *
         * @param {ObjectId} _id
         * @param {MultilingualString} name
         *
         * @memberOf PromoterOwner
         */
        constructor(_id: ObjectId, name: MultilingualString);
    }
    interface IAnonymousOwner {
        _id: ObjectId;
        name_first?: string;
        name_last?: string;
        email?: string;
        tel?: string;
    }
    /**
     * 一般所有者を作成する
     * IDは、メソッドを使用する側で事前に作成する想定
     * 確実にAnonymousOwnerモデルを作成する責任を持つ
     */
    function createAnonymous(args: IAnonymousOwner): AnonymousOwner;
    interface IPromoterOwner {
        _id: ObjectId;
        name?: MultilingualString;
    }
    function createPromoter(args: IPromoterOwner): PromoterOwner;
}
export default Owner;
