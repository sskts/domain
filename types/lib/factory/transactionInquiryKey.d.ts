/**
 * 取引照会キーファクトリー
 *
 * @namespace TransactionInquiryKeyFactory
 */
import TransactionInquiryKey from "../model/transactionInquiryKey";
export declare function create(args: {
    theater_code: string;
    reserve_num: number;
    tel: string;
}): TransactionInquiryKey;
