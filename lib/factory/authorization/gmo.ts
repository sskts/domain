/**
 * GMOオーソリファクトリー
 *
 * @namespace GMOAuthorizationFactory
 */
import * as _ from 'underscore';

import * as AuthorizationFactory from '../authorization';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

import AuthorizationGroup from '../authorizationGroup';
import ObjectId from '../objectId';

/**
 * GMOオーソリ
 *
 * @param {string} gmo_shop_id
 * @param {string} gmo_shop_pass
 * @param {string} gmo_order_id
 * @param {number} gmo_amount
 * @param {string} gmo_access_id
 * @param {string} gmo_access_pass
 * @param {string} gmo_job_cd
 * @param {string} gmo_pay_type
 */
export interface IGMOAuthorization extends AuthorizationFactory.IAuthorization {
    gmo_shop_id: string;
    gmo_shop_pass: string;
    gmo_order_id: string;
    gmo_amount: number;
    gmo_access_id: string;
    gmo_access_pass: string;
    gmo_job_cd: string;
    gmo_pay_type: string;
}

export function create(args: {
    id?: string;
    price: number;
    owner_from: string;
    owner_to: string;
    gmo_shop_id: string;
    gmo_shop_pass: string;
    gmo_order_id: string;
    gmo_amount: number;
    gmo_access_id: string;
    gmo_access_pass: string;
    gmo_job_cd: string;
    gmo_pay_type: string;
}): IGMOAuthorization {
    if (_.isEmpty(args.owner_from)) throw new ArgumentNullError('owner_from');
    if (_.isEmpty(args.owner_to)) throw new ArgumentNullError('owner_to');
    if (_.isEmpty(args.gmo_shop_id)) throw new ArgumentNullError('gmo_shop_id');
    if (_.isEmpty(args.gmo_shop_pass)) throw new ArgumentNullError('gmo_shop_pass');
    if (_.isEmpty(args.gmo_order_id)) throw new ArgumentNullError('gmo_order_id');
    if (_.isEmpty(args.gmo_access_id)) throw new ArgumentNullError('gmo_access_id');
    if (_.isEmpty(args.gmo_access_pass)) throw new ArgumentNullError('gmo_access_pass');

    if (!_.isNumber(args.price)) throw new ArgumentError('price', 'price should be number');
    if (!_.isNumber(args.gmo_amount)) throw new ArgumentError('gmo_amount', 'gmo_amount should be number');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: AuthorizationGroup.GMO,
        price: args.price,
        owner_from: args.owner_from,
        owner_to: args.owner_to,
        gmo_shop_id: args.gmo_shop_id,
        gmo_shop_pass: args.gmo_shop_pass,
        gmo_order_id: args.gmo_order_id,
        gmo_amount: args.gmo_amount,
        gmo_access_id: args.gmo_access_id,
        gmo_access_pass: args.gmo_access_pass,
        gmo_job_cd: args.gmo_job_cd,
        gmo_pay_type: args.gmo_pay_type
    };
}
