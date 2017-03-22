import * as COASeatReservationAuthorization from '../factory/authorization/coaSeatReservation';
import * as Transaction from '../factory/transaction';
import AssetAdapter from '../adapter/asset';
import TransactionAdapter from '../adapter/transaction';
/**
 * 資産承認解除(COA座席予約)
 *
 * @param {COASeatReservationAuthorization.ICOASeatReservationAuthorization} authorization
 *
 * @memberOf StockService
 */
export declare function unauthorizeCOASeatReservation(authorization: COASeatReservationAuthorization.ICOASeatReservationAuthorization): () => Promise<void>;
/**
 * 資産移動(COA座席予約)
 *
 * @param {COASeatReservationAuthorization} authorization
 * @returns {AssetOperation<void>}
 *
 * @memberOf StockService
 */
export declare function transferCOASeatReservation(authorization: COASeatReservationAuthorization.ICOASeatReservationAuthorization): (assetAdapter: AssetAdapter) => Promise<void>;
/**
 * 取引照会を無効にする
 * COAのゴミ購入データを削除する
 *
 * @memberOf StockService
 */
export declare function disableTransactionInquiry(transaction: Transaction.ITransaction): (transactionAdapter: TransactionAdapter) => Promise<void>;
