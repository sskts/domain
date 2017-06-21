/**
 * 会員所有者ファクトリー
 *
 * @namespace factory/owner/member
 */

import * as _ from 'underscore';
import * as validator from 'validator';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

import IMultilingualString from '../multilingualString';
import ObjectId from '../objectId';
import * as OwnerFactory from '../owner';
import OwnerGroup from '../ownerGroup';
import * as GMOPaymentAgencyMemberFactory from '../paymentAgencyMember/gmo';

/**
 * 会員で利用可能な決済代行会社会員インターフェース
 * GMO会員以外を持つようになれば、ここを拡張する
 */
export type IAvailablePaymentAgencyMember = GMOPaymentAgencyMemberFactory.IGMOPaymentAgencyMember;

/**
 * 会員所有者インターフェース
 *
 * @interface IMemberOwner
 * @extends {OwnerFactory.IOwner}
 * @memberof factory/owner/member
 */
export interface IMemberOwner extends OwnerFactory.IOwner {
    /**
     * ユーザーネーム
     */
    username: string;
    /**
     * パスワードハッシュ
     */
    password_hash: string;
    /**
     * 名
     */
    name_first: string;
    /**
     * 姓
     */
    name_last: string;
    /**
     * メールアドレス
     */
    email: string;
    /**
     * 電話番号
     */
    tel: string;
    /**
     * 説明
     */
    description: IMultilingualString;
    /**
     * 備考
     */
    notes: IMultilingualString;
    /**
     * 決済代行会社会員リスト
     *
     * @type {IAvailablePaymentAgencyMember[]}
     * @memberof IMemberOwner
     */
    payment_agency_members: IAvailablePaymentAgencyMember[];
}

export function create(args: {
    id?: string;
    username: string;
    password_hash: string;
    name_first: string;
    name_last: string;
    email: string;
    tel?: string;
    description?: IMultilingualString;
    notes?: IMultilingualString;
    payment_agency_members: IAvailablePaymentAgencyMember[];
}): IMemberOwner {
    if (_.isEmpty(args.username)) throw new ArgumentNullError('username');
    if (_.isEmpty(args.password_hash)) throw new ArgumentNullError('password_hash');
    if (_.isEmpty(args.name_first)) throw new ArgumentNullError('name_first');
    if (_.isEmpty(args.name_last)) throw new ArgumentNullError('name_last');
    if (_.isEmpty(args.email)) throw new ArgumentNullError('email');

    if (!validator.isEmail(args.email)) {
        throw new ArgumentError('email', 'invalid email');
    }

    if (!_.isArray(args.payment_agency_members)) {
        throw new ArgumentError('payment_agency_members', 'payment_agency_members should be array');
    }

    if (args.payment_agency_members.length === 0) {
        throw new ArgumentError('payment_agency_members', 'payment_agency_members should not be empty');
    }

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: OwnerGroup.MEMBER,
        username: args.username,
        password_hash: args.password_hash,
        name_first: args.name_first,
        name_last: args.name_last,
        email: args.email,
        tel: (args.tel === undefined) ? '' : args.tel,
        description: (args.description === undefined) ? { en: '', ja: '' } : args.description,
        notes: (args.notes === undefined) ? { en: '', ja: '' } : args.notes,
        payment_agency_members: args.payment_agency_members
    };
}
