import * as factory from '@motionpicture/sskts-factory';
import OwnershipInfoAdapter from '../adapter/ownershipInfo';
export declare type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
/**
 * 資産承認解除(COA座席予約)
 *
 * @memberof service/stock
 */
export declare function unauthorizeSeatReservation(transaction: IPlaceOrderTransaction): () => Promise<void>;
/**
 * 資産移動(COA座席予約)
 *
 * @param {ISeatReservationAuthorization} authorization
 * @memberof service/stock
 */
export declare function transferSeatReservation(transaction: IPlaceOrderTransaction): (ownershipInfoAdapter: OwnershipInfoAdapter) => Promise<void>;
