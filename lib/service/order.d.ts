/**
 * order service
 * @namespace service/order
 */
import * as factory from '@motionpicture/sskts-factory';
import OrderRepository from '../repository/order';
import TransactionRepository from '../repository/transaction';
export declare type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
export declare function createFromTransaction(transactionId: string): (orderRepository: OrderRepository, transactionRepository: TransactionRepository) => Promise<void>;
/**
 * find an order by an inquiry key
 * @param {factory.order.IOrderInquiryKey} orderInquiryKey
 */
export declare function findByOrderInquiryKey(orderInquiryKey: factory.order.IOrderInquiryKey): (orderRepository: OrderRepository) => Promise<factory.order.IOrder>;
