/**
 *
 * @interface ITransactionInquiryKey
 * @memberof tobereplaced$
 */
export interface ITransactionInquiryKey {
    theater_code: string;
    reserve_num: number;
    tel: string;
}
/**
 *
 * @returns {ITransactionInquiryKey}
 * @memberof tobereplaced$
 */
export declare function create(args: {
    theater_code: string;
    reserve_num: number;
    tel: string;
}): ITransactionInquiryKey;
