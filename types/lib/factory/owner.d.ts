/// <reference types="mongoose" />
/**
 * 所有者ファクトリー
 *
 * @namespace OwnerFactory
 */
import MultilingualString from '../model/multilingualString';
import ObjectId from '../model/objectId';
import Owner from '../model/owner';
import AnonymousOwner from '../model/owner/anonymous';
import PromoterOwner from '../model/owner/promoter';
import OwnerGroup from '../model/ownerGroup';
export declare function create(args: {
    _id: ObjectId;
    group: OwnerGroup;
}): Owner;
/**
 * 一般所有者を作成する
 * IDは、メソッドを使用する側で事前に作成する想定
 * 確実にAnonymousOwnerモデルを作成する責任を持つ
 */
export declare function createAnonymous(args: {
    _id: ObjectId;
    name_first?: string;
    name_last?: string;
    email?: string;
    tel?: string;
}): AnonymousOwner;
export declare function createAdministrator(args: {
    _id: ObjectId;
    name?: MultilingualString;
}): PromoterOwner;
