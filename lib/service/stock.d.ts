import * as factory from '@motionpicture/sskts-factory';
import OwnershipInfoAdapter from '../adapter/ownershipInfo';
import TransactionAdapter from '../adapter/transaction';
export declare type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
/**
 * 資産承認解除(COA座席予約)
 *
 * @memberof service/stock
 */
export declare function unauthorizeSeatReservation(transactionId: string): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 資産移動(COA座席予約)
 *
 * @param {ISeatReservationAuthorization} authorization
 * @memberof service/stock
 */
export declare function transferSeatReservation(transactionId: string): (ownershipInfoAdapter: OwnershipInfoAdapter, transactionAdapter: TransactionAdapter) => Promise<void>;
