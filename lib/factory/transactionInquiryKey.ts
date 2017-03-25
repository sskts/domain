/**
 * 取引照会キーファクトリー
 *
 * @namespace TransactionInquiryKeyFactory
 */
import * as validator from 'validator';

import ArgumentError from '../error/argument';
import ArgumentNullError from '../error/argumentNull';

export interface ITransactionInquiryKey {
    theater_code: string;
    reserve_num: number;
    tel: string;
}

export function create(args: {
    theater_code: string;
    reserve_num: number;
    tel: string;
}): ITransactionInquiryKey {
    if (validator.isEmpty(args.theater_code)) throw new ArgumentNullError('theater_code');

    if (!validator.isInt(args.reserve_num.toString())) throw new ArgumentError('reserve_num', 'reserve_num should be number');

    return {
        theater_code: args.theater_code,
        reserve_num: args.reserve_num,
        tel: args.tel
    };
}
