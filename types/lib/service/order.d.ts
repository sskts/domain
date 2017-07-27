/**
 * 注文サービス
 *
 * @namespace service/order
 */
import * as monapt from 'monapt';
import OrderAdapter from '../adapter/order';
import * as OrderFactory from '../factory/order';
import * as OrderInquiryKeyFactory from '../factory/orderInquiryKey';
import * as PlaceOrderTransactionFactory from '../factory/transaction/placeOrder';
export declare type IPlaceOrderTransaction = PlaceOrderTransactionFactory.ITransaction;
export declare function createFromTransaction(transaction: IPlaceOrderTransaction): (orderAdapter: OrderAdapter) => Promise<void>;
/**
 * 注文内容を照会する
 */
export declare function findByOrderInquiryKey(orderInquiryKey: OrderInquiryKeyFactory.IOrderInquiryKey): (orderAdapter: OrderAdapter) => Promise<monapt.Option<OrderFactory.IOrder>>;
