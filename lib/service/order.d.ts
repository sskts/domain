/**
 * 注文サービス
 *
 * @namespace service/order
 */
import * as factory from '@motionpicture/sskts-factory';
import * as monapt from 'monapt';
import OrderAdapter from '../adapter/order';
export declare type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
export declare function createFromTransaction(transaction: IPlaceOrderTransaction): (orderAdapter: OrderAdapter) => Promise<void>;
/**
 * 注文内容を照会する
 */
export declare function findByOrderInquiryKey(orderInquiryKey: factory.orderInquiryKey.IOrderInquiryKey): (orderAdapter: OrderAdapter) => Promise<monapt.Option<factory.order.IOrder>>;
