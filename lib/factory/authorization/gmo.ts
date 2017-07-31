/**
 * GMOオーソリファクトリー
 *
 * @namespace factory/authorization/gmo
 */

import * as GMO from '@motionpicture/gmo-service';
import * as _ from 'underscore';

import * as AuthorizationFactory from '../authorization';

import ArgumentError from '../../error/argument';

import AuthorizationGroup from '../authorizationGroup';
import ObjectId from '../objectId';

/**
 * オーソリ対象インターフェース
 */
export type IObject = GMO.services.credit.IEntryTranArgs & GMO.services.credit.IExecTranArgs & {
    payType: string;
};

/**
 * GMOオーソリインターフェース
 */
export interface IAuthorization extends AuthorizationFactory.IAuthorization {
    /**
     * 承認結果
     */
    result: GMO.services.credit.IExecTranResult;
    /**
     * 承認対象
     */
    object: IObject;
}

export function create(args: {
    id?: string;
    price: number;
    result: GMO.services.credit.IExecTranResult;
    object: IObject;
}): IAuthorization {
    if (!_.isNumber(args.price)) throw new ArgumentError('price', 'price should be number');
    if (args.price <= 0) throw new ArgumentError('price', 'price should be greater than 0');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: AuthorizationGroup.GMO,
        price: args.price,
        result: args.result,
        object: args.object
    };
}
