import * as COASeatReservationAuthorizationFactory from '../factory/authorization/coaSeatReservation';
import * as TransactionFactory from '../factory/transaction';
import AssetAdapter from '../adapter/asset';
import OwnerAdapter from '../adapter/owner';
import PerformanceAdapter from '../adapter/performance';
import TransactionAdapter from '../adapter/transaction';
/**
 * 資産承認解除(COA座席予約)
 *
 * @param {COASeatReservationAuthorization.ICOASeatReservationAuthorization} authorization
 *
 * @memberof service/stock
 */
export declare function unauthorizeCOASeatReservation(authorization: COASeatReservationAuthorizationFactory.ICOASeatReservationAuthorization): () => Promise<void>;
/**
 * 資産移動(COA座席予約)
 *
 * @param {COASeatReservationAuthorization} authorization
 * @returns {AssetOperation<void>}
 *
 * @memberof service/stock
 */
export declare function transferCOASeatReservation(authorization: COASeatReservationAuthorizationFactory.ICOASeatReservationAuthorization): (assetAdapter: AssetAdapter, ownerAdapter: OwnerAdapter, performanceAdapter: PerformanceAdapter) => Promise<void>;
/**
 * 取引照会を無効にする
 * COAのゴミ購入データを削除する
 *
 * @memberof service/stock
 */
export declare function disableTransactionInquiry(transaction: TransactionFactory.ITransaction): (transactionAdapter: TransactionAdapter) => Promise<void>;
