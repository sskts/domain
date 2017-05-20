/**
 * 所有権認証記録ファクトリー
 * いつ、どこで、何のために、どうやって所有権が認証されたのか
 *
 * @namespace factory/ownershipAuthenticationRecord
 */

import * as _ from 'underscore';

import ArgumentError from '../error/argument';
import ArgumentNullError from '../error/argumentNull';

/**
 * 所有権認証記録インターフェース
 *
 * @param {string} when いつ
 * @param {string} where どこで
 * @param {boolean} why 何のために
 * @param {boolean} how どうやって
 * @memberof factory/ownershipAuthenticationRecord
 */
export interface IOwnershipAuthenticationRecord {
    when: Date;
    where: string;
    why: string;
    how: string;
}

/**
 * 所有権認証記録を生成する
 *
 * @memberof factory/ownershipAuthenticationRecord
 */
export function create(args: {
    when: Date;
    where: string;
    why: string;
    how: string;
}): IOwnershipAuthenticationRecord {
    if (!_.isDate(args.when)) throw new ArgumentError('when', 'when should be Date');
    if (_.isEmpty(args.where)) throw new ArgumentNullError('where');
    if (_.isEmpty(args.why)) throw new ArgumentNullError('why');
    if (_.isEmpty(args.how)) throw new ArgumentNullError('how');

    return args;
}
