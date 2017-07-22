import * as BuyActionFactory from '../factory/action/buyAction';
import * as COASeatReservationAuthorizationFactory from '../factory/authorization/coaSeatReservation';
import OwnershipInfoAdapter from '../adapter/ownershipInfo';
import PersonAdapter from '../adapter/person';
import TransactionAdapter from '../adapter/transaction';
export declare type ICOASeatReservationAuthorization = COASeatReservationAuthorizationFactory.IAuthorization;
/**
 * 資産承認解除(COA座席予約)
 *
 * @param {ICOASeatReservationAuthorization} authorization
 * @memberof service/stock
 */
export declare function unauthorizeCOASeatReservation(authorization: ICOASeatReservationAuthorization): () => Promise<void>;
/**
 * 資産移動(COA座席予約)
 *
 * @param {ICOASeatReservationAuthorization} authorization
 * @memberof service/stock
 */
export declare function transferCOASeatReservation(authorization: ICOASeatReservationAuthorization): (ownershipInfoAdapter: OwnershipInfoAdapter, personAdapter: PersonAdapter) => Promise<void>;
/**
 * 取引照会を無効にする
 * COAのゴミ購入データを削除する
 *
 * @memberof service/stock
 */
export declare function disableTransactionInquiry(buyAction: BuyActionFactory.IAction): (transactionAdapter: TransactionAdapter) => Promise<void>;
