export interface IOrderInquiryKey {
    theaterCode: string;
    orderNumber: number;
    telephone: string;
}
export declare function create(args: {
    theaterCode: string;
    orderNumber: number;
    telephone: string;
}): IOrderInquiryKey;
