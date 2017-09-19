import * as factory from '@motionpicture/sskts-factory';
import { MongoRepository as TransactionRepository } from '../repo/transaction';
export declare type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
/**
 * 資産承認解除(COA座席予約)
 *
 * @memberof service/stock
 */
export declare function unauthorizeSeatReservation(transactionId: string): (transactionRepository: TransactionRepository) => Promise<void>;
/**
 * 資産移動(COA座席予約)
 *
 * @param {ISeatReservationAuthorization} authorizeAction
 * @memberof service/stock
 */
export declare function transferSeatReservation(transactionId: string): (transactionRepository: TransactionRepository) => Promise<void>;
