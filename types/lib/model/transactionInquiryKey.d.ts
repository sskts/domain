/**
 * 取引照会キー
 *
 * @class TransactionInquiryKey
 *
 * @param {string} theater_code
 * @param {number} reserve_num
 * @param {string} tel
 */
declare class TransactionInquiryKey {
    readonly theater_code: string;
    readonly reserve_num: number;
    readonly tel: string;
    constructor(theater_code: string, reserve_num: number, tel: string);
}
declare namespace TransactionInquiryKey {
    interface ITransactionInquiryKey {
        theater_code: string;
        reserve_num: number;
        tel: string;
    }
    function create(args: ITransactionInquiryKey): TransactionInquiryKey;
}
export default TransactionInquiryKey;
