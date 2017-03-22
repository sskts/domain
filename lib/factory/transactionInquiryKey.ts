/**
 * 取引照会キーファクトリー
 *
 * @namespace TransactionInquiryKeyFactory
 */

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
    return {
        theater_code: args.theater_code,
        reserve_num: args.reserve_num,
        tel: args.tel
    };
}
