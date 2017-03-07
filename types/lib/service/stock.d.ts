import * as Authorization from '../model/authorization';
import * as Transaction from '../model/transaction';
import AssetRepository from '../repository/asset';
import TransactionRepository from '../repository/transaction';
/**
 * 資産承認解除(COA座席予約)
 *
 * @param {COASeatReservationAuthorization} authorization
 * @returns {COAOperation<void>}
 *
 * @memberOf StockServiceInterpreter
 */
export declare function unauthorizeCOASeatReservation(authorization: Authorization.ICOASeatReservationAuthorization): () => Promise<void>;
/**
 * 資産移動(COA座席予約)
 *
 * @param {COASeatReservationAuthorization} authorization
 * @returns {AssetOperation<void>}
 *
 * @memberOf StockServiceInterpreter
 */
export declare function transferCOASeatReservation(authorization: Authorization.ICOASeatReservationAuthorization): (assetRepository: AssetRepository) => Promise<void>;
/**
 * 取引照会を無効にする
 * COAのゴミ購入データを削除する
 *
 * @memberOf StockServiceInterpreter
 */
export declare function disableTransactionInquiry(transaction: Transaction.ITransaction): (transactionRepository: TransactionRepository) => Promise<void>;
