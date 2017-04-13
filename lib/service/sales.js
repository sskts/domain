"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 売上サービス
 *
 * @namespace SalesService
 */
const GMO = require("@motionpicture/gmo-service");
const createDebug = require("debug");
const debug = createDebug('sskts-domain:service:sales');
/**
 * GMOオーソリ取消
 */
function cancelGMOAuth(authorization) {
    return () => __awaiter(this, void 0, void 0, function* () {
        debug('calling alterTran...');
        yield GMO.CreditService.alterTran({
            shopId: authorization.gmo_shop_id,
            shopPass: authorization.gmo_shop_pass,
            accessId: authorization.gmo_access_id,
            accessPass: authorization.gmo_access_pass,
            jobCd: GMO.Util.JOB_CD_VOID,
            amount: authorization.gmo_amount
        });
        // 失敗したら取引状態確認してどうこう、という処理も考えうるが、
        // GMOはapiのコール制限が厳しく、下手にコールするとすぐにクライアントサイドにも影響をあたえてしまう
        // リトライはキューの仕組みに含まれているので失敗してもここでは何もしない
    });
}
exports.cancelGMOAuth = cancelGMOAuth;
/**
 * GMO売上確定
 */
function settleGMOAuth(authorization) {
    return () => __awaiter(this, void 0, void 0, function* () {
        // 取引状態参照
        const searchTradeResult = yield GMO.CreditService.searchTrade({
            shopId: authorization.gmo_shop_id,
            shopPass: authorization.gmo_shop_pass,
            orderId: authorization.gmo_order_id
        });
        if (searchTradeResult.jobCd === GMO.Util.JOB_CD_SALES) {
            debug('already in SALES');
            // すでに実売上済み
            return;
        }
        debug('calling alterTran...');
        yield GMO.CreditService.alterTran({
            shopId: authorization.gmo_shop_id,
            shopPass: authorization.gmo_shop_pass,
            accessId: authorization.gmo_access_id,
            accessPass: authorization.gmo_access_pass,
            jobCd: GMO.Util.JOB_CD_SALES,
            amount: authorization.gmo_amount
        });
        // 失敗したら取引状態確認してどうこう、という処理も考えうるが、
        // GMOはapiのコール制限が厳しく、下手にコールするとすぐにクライアントサイドにも影響をあたえてしまう
        // リトライはキューの仕組みに含まれているので失敗してもここでは何もしない
    });
}
exports.settleGMOAuth = settleGMOAuth;
/**
 * ムビチケ着券取消し
 */
function cancelMvtkAuthorization(__) {
    return () => __awaiter(this, void 0, void 0, function* () {
        // ムビチケは実は仮押さえの仕組みがないので何もしない
    });
}
exports.cancelMvtkAuthorization = cancelMvtkAuthorization;
/**
 * ムビチケ資産移動
 */
function settleMvtkAuthorization(__) {
    return () => __awaiter(this, void 0, void 0, function* () {
        // 実は取引成立の前に着券済みなので何もしない
    });
}
exports.settleMvtkAuthorization = settleMvtkAuthorization;
