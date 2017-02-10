import TransactionInquiryKey from "../model/transactionInquiryKey";
/**
 * 取引照会キーファクトリー
 *
 * @namespace
 */
declare namespace TransactionInquiryKeyFactory {
    function create(args: {
        theater_code: string;
        reserve_num: number;
        tel: string;
    }): TransactionInquiryKey;
}
export default TransactionInquiryKeyFactory;
