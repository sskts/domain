/**
 * order service
 * @namespace service/order
 */
import * as factory from '@motionpicture/sskts-factory';
import { MongoRepository as OrderRepository } from '../repo/order';
import { MongoRepository as TransactionRepository } from '../repo/transaction';
export declare type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
export declare function createFromTransaction(transactionId: string): (orderRepository: OrderRepository, transactionRepository: TransactionRepository) => Promise<void>;
