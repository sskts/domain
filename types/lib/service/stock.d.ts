import * as PlaceOrderTransactionFactory from '../factory/transaction/placeOrder';
import OwnershipInfoAdapter from '../adapter/ownershipInfo';
import PersonAdapter from '../adapter/person';
export declare type IPlaceOrderTransaction = PlaceOrderTransactionFactory.ITransaction;
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
export declare function transferSeatReservation(transaction: IPlaceOrderTransaction): (ownershipInfoAdapter: OwnershipInfoAdapter, personAdapter: PersonAdapter) => Promise<void>;
