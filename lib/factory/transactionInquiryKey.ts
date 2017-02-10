import TransactionInquiryKey from "../model/transactionInquiryKey";

/**
 * 取引照会キーファクトリー
 *
 * @namespace
 */
namespace TransactionInquiryKeyFactory {
    export function create(args: {
        theater_code: string,
        reserve_num: number,
        tel: string,
    }) {
        return new TransactionInquiryKey(
            args.theater_code,
            args.reserve_num,
            args.tel,
        );
    }
}

export default TransactionInquiryKeyFactory;