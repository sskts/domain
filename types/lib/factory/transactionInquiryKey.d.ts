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
export declare function create(args: {
    theater_code: string;
    reserve_num: number;
    tel: string;
}): ITransactionInquiryKey;
