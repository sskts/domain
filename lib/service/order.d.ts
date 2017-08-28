/**
 * order service
 * @namespace service/order
 */
import * as factory from '@motionpicture/sskts-factory';
import * as monapt from 'monapt';
import OrderAdapter from '../adapter/order';
import TransactionAdapter from '../adapter/transaction';
export declare type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
export declare function createFromTransaction(transactionId: string): (orderAdapter: OrderAdapter, transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * find an order by an inquiry key
 * @param {factory.order.IOrderInquiryKey} orderInquiryKey
 */
export declare function findByOrderInquiryKey(orderInquiryKey: factory.order.IOrderInquiryKey): (orderAdapter: OrderAdapter) => Promise<monapt.Option<factory.order.IOrder>>;
