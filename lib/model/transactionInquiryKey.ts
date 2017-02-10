export default class TransactionInquiryKey {
    constructor(
        readonly theater_code: string,
        readonly reserve_num: number,
        readonly tel: string,
    ) {
        // TODO validation
    }
}