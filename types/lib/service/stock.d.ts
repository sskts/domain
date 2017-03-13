import * as Authorization from '../factory/authorization';
import * as Transaction from '../factory/transaction';
import AssetAdapter from '../adapter/asset';
import TransactionAdapter from '../adapter/transaction';
/**
 * 資産承認解除(COA座席予約)
 *
 * @param {COASeatReservationAuthorization} authorization
 * @returns {COAOperation<void>}
 *
 * @memberOf StockService
 */
export declare function unauthorizeCOASeatReservation(authorization: Authorization.ICOASeatReservationAuthorization): () => Promise<void>;
/**
 * 資産移動(COA座席予約)
 *
 * @param {COASeatReservationAuthorization} authorization
 * @returns {AssetOperation<void>}
 *
 * @memberOf StockService
 */
export declare function transferCOASeatReservation(authorization: Authorization.ICOASeatReservationAuthorization): (assetAdapter: AssetAdapter) => Promise<void>;
/**
 * 取引照会を無効にする
 * COAのゴミ購入データを削除する
 *
 * @memberOf StockService
 */
export declare function disableTransactionInquiry(transaction: Transaction.ITransaction): (transactionAdapter: TransactionAdapter) => Promise<void>;
