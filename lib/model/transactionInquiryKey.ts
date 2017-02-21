// tslint:disable:variable-name
/**
 * 取引照会キー
 *
 * @class TransactionInquiryKey
 *
 * @param {string} theater_code
 * @param {number} reserve_num
 * @param {string} tel
 */
class TransactionInquiryKey {
    constructor(
        readonly theater_code: string,
        readonly reserve_num: number,
        readonly tel: string
    ) {
        // todo validation
    }
}

namespace TransactionInquiryKey {
    export interface ITransactionInquiryKey {
        theater_code: string;
        reserve_num: number;
        tel: string;
    }

    export function create(args: ITransactionInquiryKey) {
        return new TransactionInquiryKey(
            args.theater_code,
            args.reserve_num,
            args.tel
        );
    }
}

export default TransactionInquiryKey;
