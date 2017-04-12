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
 * 売上サービステスト
 *
 * @ignore
 */
const GMO = require("@motionpicture/gmo-service");
const assert = require("assert");
const mongoose = require("mongoose");
const GMOAuthorizationFactory = require("../../lib/factory/authorization/gmo");
const MVTKAuthorizationFactory = require("../../lib/factory/authorization/mvtk");
const SalesService = require("../../lib/service/sales");
let connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});
describe('売上サービス GMO実売上', () => {
    it('仮売上の状態からOK', () => __awaiter(this, void 0, void 0, function* () {
        const orderId = Date.now().toString();
        const shopId = 'tshop00026096';
        const shopPass = 'xbxmkaa6';
        const amount = 1234;
        const entryTranResult = yield GMO.CreditService.entryTran({
            shopId: shopId,
            shopPass: shopPass,
            orderId: orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: amount
        });
        yield GMO.CreditService.execTran({
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            orderId: orderId,
            method: '1',
            cardNo: '4111111111111111',
            expire: '2012',
            securityCode: '123'
        });
        const authorization = GMOAuthorizationFactory.create({
            price: amount,
            owner_from: 'xxx',
            owner_to: 'xxx',
            gmo_shop_id: shopId,
            gmo_shop_pass: shopPass,
            gmo_order_id: orderId,
            gmo_amount: amount,
            gmo_access_id: entryTranResult.accessId,
            gmo_access_pass: entryTranResult.accessPass,
            gmo_job_cd: GMO.Util.JOB_CD_AUTH,
            gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT
        });
        yield SalesService.settleGMOAuth(authorization)();
        const searchTradeResult = yield GMO.CreditService.searchTrade({
            shopId: shopId,
            shopPass: shopPass,
            orderId: orderId
        });
        assert(searchTradeResult.orderId, orderId);
        assert(searchTradeResult.jobCd, GMO.Util.JOB_CD_SALES);
    }));
    it('すでに実売上済みなのでOK', () => __awaiter(this, void 0, void 0, function* () {
        const orderId = Date.now().toString();
        const shopId = 'tshop00026096';
        const shopPass = 'xbxmkaa6';
        const amount = 1234;
        const entryTranResult = yield GMO.CreditService.entryTran({
            shopId: shopId,
            shopPass: shopPass,
            orderId: orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: amount
        });
        yield GMO.CreditService.execTran({
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            orderId: orderId,
            method: '1',
            cardNo: '4111111111111111',
            expire: '2012',
            securityCode: '123'
        });
        yield GMO.CreditService.alterTran({
            shopId: shopId,
            shopPass: shopPass,
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            jobCd: GMO.Util.JOB_CD_SALES,
            amount: amount
        });
        const authorization = GMOAuthorizationFactory.create({
            price: amount,
            owner_from: 'xxx',
            owner_to: 'xxx',
            gmo_shop_id: shopId,
            gmo_shop_pass: shopPass,
            gmo_order_id: orderId,
            gmo_amount: amount,
            gmo_access_id: entryTranResult.accessId,
            gmo_access_pass: entryTranResult.accessPass,
            gmo_job_cd: GMO.Util.JOB_CD_AUTH,
            gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT
        });
        yield SalesService.settleGMOAuth(authorization)();
    }));
});
describe('売上サービス ムビチケ資産移動', () => {
    it('OK', () => __awaiter(this, void 0, void 0, function* () {
        const authorization = MVTKAuthorizationFactory.create({
            price: 1234,
            owner_from: 'xxx',
            owner_to: 'xxx',
            kgygish_cd: 'xxx',
            yyk_dvc_typ: 'xxx',
            trksh_flg: 'xxx',
            kgygish_sstm_zskyyk_no: 'xxx',
            kgygish_usr_zskyyk_no: 'xxx',
            jei_dt: 'xxx',
            kij_ymd: 'xxx',
            st_cd: 'xxx',
            scren_cd: 'xxx',
            knyknr_no_info: [{
                    knyknr_no: 'xxx',
                    pin_cd: 'xxx',
                    knsh_info: [{
                            knsh_typ: 'xxx',
                            mi_num: 'xxx'
                        }]
                }],
            zsk_info: [{
                    zsk_cd: 'xxx'
                }],
            skhn_cd: 'xxx'
        });
        yield SalesService.settleMvtkAuthorization(authorization)();
    }));
});
