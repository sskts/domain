/**
 * GMOオーソリファクトリー
 *
 * @namespace factory/authorization/gmo
 */

import * as GMO from '@motionpicture/gmo-service';
import * as _ from 'underscore';

import * as AuthorizationFactory from '../authorization';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

import AuthorizationGroup from '../authorizationGroup';
import ObjectId from '../objectId';

export type IObject = GMO.services.credit.IEntryTranArgs & GMO.services.credit.IExecTranArgs & {
    payType: string;
};

/**
 * GMOオーソリ
 */
export interface IAuthorization extends AuthorizationFactory.IAuthorization {
    result: GMO.services.credit.IExecTranResult;
    object: IObject;
}

export function create(args: {
    id?: string;
    price: number;
    agent: AuthorizationFactory.IOwner;
    recipient: AuthorizationFactory.IOwner;
    result: GMO.services.credit.IExecTranResult;
    object: IObject;
}): IAuthorization {
    if (_.isEmpty(args.agent)) throw new ArgumentNullError('agent');
    if (_.isEmpty(args.recipient)) throw new ArgumentNullError('recipient');

    if (!_.isNumber(args.price)) throw new ArgumentError('price', 'price should be number');
    if (args.price <= 0) throw new ArgumentError('price', 'price should be greater than 0');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: AuthorizationGroup.GMO,
        price: args.price,
        agent: args.agent,
        recipient: args.recipient,
        result: args.result,
        object: args.object
    };
}
