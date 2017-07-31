"use strict";
/**
 * 売上サービス
 *
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
const createDebug = require("debug");
const authorizationGroup_1 = require("../factory/authorizationGroup");
const debug = createDebug('sskts-domain:service:sales');
/**
 * GMOオーソリ取消
 *
 * @memberof service/sales
 */
function cancelGMOAuth(transaction) {
    return () => __awaiter(this, void 0, void 0, function* () {
        const authorization = transaction.object.paymentInfos.find((paymentInfo) => paymentInfo.group === authorizationGroup_1.default.GMO);
        if (authorization !== undefined) {
            debug('calling alterTran...');
            yield GMO.services.credit.alterTran({
                shopId: authorization.object.shopId,
                shopPass: authorization.object.shopPass,
                accessId: authorization.object.accessId,
                accessPass: authorization.object.accessPass,
                jobCd: GMO.utils.util.JobCd.Void,
                amount: authorization.object.amount
            });
        }
        // 失敗したら取引状態確認してどうこう、という処理も考えうるが、
        // GMOはapiのコール制限が厳しく、下手にコールするとすぐにクライアントサイドにも影響をあたえてしまう
        // リトライはタスクの仕組みに含まれているので失敗してもここでは何もしない
    });
}
exports.cancelGMOAuth = cancelGMOAuth;
/**
 * GMO売上確定
 *
 * @memberof service/sales
 */
function settleGMOAuth(transaction) {
    return () => __awaiter(this, void 0, void 0, function* () {
        const authorization = transaction.object.paymentInfos.find((paymentInfo) => paymentInfo.group === authorizationGroup_1.default.GMO);
        if (authorization !== undefined) {
            // 取引状態参照
            const searchTradeResult = yield GMO.services.credit.searchTrade({
                shopId: authorization.object.shopId,
                shopPass: authorization.object.shopPass,
                orderId: authorization.object.orderId
            });
            if (searchTradeResult.jobCd === GMO.utils.util.JobCd.Sales) {
                debug('already in SALES');
                // すでに実売上済み
                return;
            }
            debug('calling alterTran...');
            yield GMO.services.credit.alterTran({
                shopId: authorization.object.shopId,
                shopPass: authorization.object.shopPass,
                accessId: authorization.object.accessId,
                accessPass: authorization.object.accessPass,
                jobCd: GMO.utils.util.JobCd.Sales,
                amount: authorization.object.amount
            });
            // 失敗したら取引状態確認してどうこう、という処理も考えうるが、
            // GMOはapiのコール制限が厳しく、下手にコールするとすぐにクライアントサイドにも影響をあたえてしまう
            // リトライはタスクの仕組みに含まれているので失敗してもここでは何もしない
        }
    });
}
exports.settleGMOAuth = settleGMOAuth;
/**
 * ムビチケ着券取消し
 *
 * @memberof service/sales
 */
function cancelMvtk(__) {
    return () => __awaiter(this, void 0, void 0, function* () {
        // ムビチケは実は仮押さえの仕組みがないので何もしない
    });
}
exports.cancelMvtk = cancelMvtk;
/**
 * ムビチケ資産移動
 *
 * @memberof service/sales
 */
function settleMvtk(__) {
    return () => __awaiter(this, void 0, void 0, function* () {
        // 実は取引成立の前に着券済みなので何もしない
    });
}
exports.settleMvtk = settleMvtk;
