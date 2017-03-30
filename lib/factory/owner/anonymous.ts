/**
 * 一般所有者ファクトリー
 *
 * @namespace AnonymousOwnerFactory
 */
import * as _ from 'underscore';
import * as validator from 'validator';

import ArgumentError from '../../error/argument';

import ObjectId from '../objectId';
import * as OwnerFactory from '../owner';
import OwnerGroup from '../ownerGroup';

export interface IAnonymousOwner extends OwnerFactory.IOwner {
    id: string;
    name_first: string;
    name_last: string;
    email: string;
    tel: string;
}

/**
 * 一般所有者を作成する
 */
export function create(args: {
    id?: string;
    name_first?: string;
    name_last?: string;
    email?: string;
    tel?: string;
}): IAnonymousOwner {
    if (!_.isEmpty(args.email) && !validator.isEmail(<string>args.email)) throw new ArgumentError('email', 'invalid email');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: OwnerGroup.ANONYMOUS,
        name_first: (args.name_first === undefined) ? '' : args.name_first,
        name_last: (args.name_last === undefined) ? '' : args.name_last,
        email: (args.email === undefined) ? '' : args.email,
        tel: (args.tel === undefined) ? '' : args.tel
    };
}
