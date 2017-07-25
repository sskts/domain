/**
 * 注文照会キーファクトリー
 *
 * @namespace factory/orderInquiryKey
 */

import * as _ from 'underscore';

import ArgumentError from '../error/argument';
import ArgumentNullError from '../error/argumentNull';

export interface IOrderInquiryKey {
    theaterCode: string;
    orderNumber: number;
    telephone: string;
}

export function create(args: {
    theaterCode: string;
    orderNumber: number;
    telephone: string;
}): IOrderInquiryKey {
    if (_.isEmpty(args.theaterCode)) throw new ArgumentNullError('theaterCode');
    if (!_.isNumber(args.orderNumber)) throw new ArgumentError('orderNumber', 'orderNumber should be number');
    if (_.isEmpty(args.telephone)) throw new ArgumentNullError('telephone');

    return args;
}
