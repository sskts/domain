/**
 * 所有権ファクトリー
 * 誰が、何を、所有するのか
 *
 * @namespace factory/ownership
 */

import * as _ from 'underscore';

import ArgumentNullError from '../error/argumentNull';

import ObjectId from './objectId';
import * as OwnershipAuthenticationRecordFactory from './ownershipAuthenticationRecord';

/**
 * 認証記録インターフェース
 */
export type IAuthenticationRecord = OwnershipAuthenticationRecordFactory.IOwnershipAuthenticationRecord;

/**
 * 所有権インターフェース
 *
 * @param {string} id
 * @param {string} owner 所有者
 * @param {[]} authentication_records 認証履歴
 * @memberof factory/ownership
 */
export interface IOwnership {
    id: string;
    owner: string;
    authentication_records: IAuthenticationRecord[];
}

/**
 * 所有権を生成する
 *
 * @memberof factory/ownership
 */
export function create(args: {
    id?: string,
    owner: string,
    authentication_records?: IAuthenticationRecord[]
}): IOwnership {
    if (_.isEmpty(args.owner)) throw new ArgumentNullError('owner');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        owner: args.owner,
        authentication_records: (args.authentication_records === undefined) ? [] : args.authentication_records
    };
}
