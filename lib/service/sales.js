"use strict";
/**
 * sales service
 * mainly handle transactions with GMO
 * @namespace service/sales
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const GMO = require("@motionpicture/gmo-service");
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const debug = createDebug('sskts-domain:service:sales');
/**
 * クレジットカードオーソリ取消
 * @memberof service/sales
 */
function cancelCreditCardAuth(transactionId) {
    return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderById(transactionId);
        if (transaction === null) {
            throw new factory.errors.Argument('transactionId', `transaction[${transactionId}] not found.`);
        }
        const authorizeAction = transaction.object.paymentInfos.find((paymentInfo) => paymentInfo.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.CreditCard);
        if (authorizeAction !== undefined) {
            debug('calling alterTran...');
            yield GMO.services.credit.alterTran({
                shopId: authorizeAction.object.entryTranArgs.shopId,
                shopPass: authorizeAction.object.entryTranArgs.shopPass,
                accessId: authorizeAction.object.execTranArgs.accessId,
                accessPass: authorizeAction.object.execTranArgs.accessPass,
                jobCd: GMO.utils.util.JobCd.Void,
                amount: authorizeAction.object.entryTranArgs.amount
            });
        }
        // 失敗したら取引状態確認してどうこう、という処理も考えうるが、
        // GMOはapiのコール制限が厳しく、下手にコールするとすぐにクライアントサイドにも影響をあたえてしまう
        // リトライはタスクの仕組みに含まれているので失敗してもここでは何もしない
    });
}
exports.cancelCreditCardAuth = cancelCreditCardAuth;
/**
 * クレジットカード売上確定
 * @memberof service/sales
 */
function settleCreditCardAuth(transactionId) {
    return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderById(transactionId);
        if (transaction === null) {
            throw new factory.errors.Argument('transactionId', `transaction[${transactionId}] not found.`);
        }
        const authorizeAction = transaction.object.paymentInfos.find((paymentInfo) => paymentInfo.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.CreditCard);
        if (authorizeAction !== undefined) {
            // 取引状態参照
            const searchTradeResult = yield GMO.services.credit.searchTrade({
                shopId: authorizeAction.object.entryTranArgs.shopId,
                shopPass: authorizeAction.object.entryTranArgs.shopPass,
                orderId: authorizeAction.object.entryTranArgs.orderId
            });
            if (searchTradeResult.jobCd === GMO.utils.util.JobCd.Sales) {
                debug('already in SALES');
                // すでに実売上済み
                return;
            }
            debug('calling alterTran...');
            yield GMO.services.credit.alterTran({
                shopId: authorizeAction.object.entryTranArgs.shopId,
                shopPass: authorizeAction.object.entryTranArgs.shopPass,
                accessId: authorizeAction.object.execTranArgs.accessId,
                accessPass: authorizeAction.object.execTranArgs.accessPass,
                jobCd: GMO.utils.util.JobCd.Sales,
                amount: authorizeAction.object.entryTranArgs.amount
            });
            // 失敗したら取引状態確認してどうこう、という処理も考えうるが、
            // GMOはapiのコール制限が厳しく、下手にコールするとすぐにクライアントサイドにも影響をあたえてしまう
            // リトライはタスクの仕組みに含まれているので失敗してもここでは何もしない
        }
    });
}
exports.settleCreditCardAuth = settleCreditCardAuth;
/**
 * ムビチケ着券取消し
 *
 * @memberof service/sales
 */
function cancelMvtk(__1) {
    return (__2) => __awaiter(this, void 0, void 0, function* () {
        // ムビチケは実は仮押さえの仕組みがないので何もしない
    });
}
exports.cancelMvtk = cancelMvtk;
/**
 * ムビチケ資産移動
 *
 * @memberof service/sales
 */
function settleMvtk(__1) {
    return (__2) => __awaiter(this, void 0, void 0, function* () {
        // 実は取引成立の前に着券済みなので何もしない
    });
}
exports.settleMvtk = settleMvtk;
