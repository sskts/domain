import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";
import AssetRepository from "../../repository/asset";
import TransactionRepository from "../../repository/transaction";
import StockService from "../stock";
import * as COA from "@motionpicture/coa-service";
/**
 * 在庫サービス
 *
 * @class StockServiceInterpreter
 * @implements {StockService}
 */
export default class StockServiceInterpreter implements StockService {
    /**
     * 資産承認解除(COA座席予約)
     *
     * @param {COASeatReservationAuthorization} authorization
     * @returns {COAOperation<void>}
     *
     * @memberOf StockServiceInterpreter
     */
    unauthorizeCOASeatReservation(authorization: COASeatReservationAuthorization): (coaRepository: typeof COA) => Promise<void>;
    /**
     * 資産移動(COA座席予約)
     *
     * @param {COASeatReservationAuthorization} authorization
     * @returns {AssetOperation<void>}
     *
     * @memberOf StockServiceInterpreter
     */
    transferCOASeatReservation(authorization: COASeatReservationAuthorization): (assetRepository: AssetRepository) => Promise<void>;
    /**
     * 取引照会を無効にする
     * COAのゴミ購入データを削除する
     *
     * @memberOf StockServiceInterpreter
     */
    disableTransactionInquiry(args: {
        transaction_id: string;
    }): (transactionRepository: TransactionRepository, coaRepository: typeof COA) => Promise<void>;
}
