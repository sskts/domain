/**
 * 在庫サービス
 *
 * @namespace StockService
 */
import * as COA from '@motionpicture/coa-service';
import COASeatReservationAuthorization from '../model/authorization/coaSeatReservation';
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
export declare function unauthorizeCOASeatReservation(authorization: COASeatReservationAuthorization): (coaRepository: typeof COA) => Promise<void>;
/**
 * 資産移動(COA座席予約)
 *
 * @param {COASeatReservationAuthorization} authorization
 * @returns {AssetOperation<void>}
 *
 * @memberOf StockServiceInterpreter
 */
export declare function transferCOASeatReservation(authorization: COASeatReservationAuthorization): (assetRepository: AssetRepository) => Promise<void>;
/**
 * 取引照会を無効にする
 * COAのゴミ購入データを削除する
 *
 * @memberOf StockServiceInterpreter
 */
export declare function disableTransactionInquiry(args: {
    transaction_id: string;
}): (transactionRepository: TransactionRepository, coaRepository: typeof COA) => Promise<void>;
