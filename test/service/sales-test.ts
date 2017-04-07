/**
 * 売上サービステスト
 *
 * @ignore
 */
import * as GMO from '@motionpicture/gmo-service';
import * as assert from 'assert';
import * as mongoose from 'mongoose';

import * as GMOAuthorizationFactory from '../../lib/factory/authorization/gmo';

import * as SalesService from '../../lib/service/sales';

let connection: mongoose.Connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('売上サービス GMO実売上', () => {
    it('仮売上の状態からOK', async () => {
        const orderId = Date.now().toString();
        const shopId = 'tshop00026096';
        const shopPass = 'xbxmkaa6';
        const amount = 1234;

        const entryTranResult = await GMO.CreditService.entryTran({
            shopId: shopId,
            shopPass: shopPass,
            orderId: orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: amount
        });

        await GMO.CreditService.execTran({
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

        await SalesService.settleGMOAuth(authorization)();

        const searchTradeResult = await GMO.CreditService.searchTrade({
            shopId: shopId,
            shopPass: shopPass,
            orderId: orderId
        });

        assert(searchTradeResult.orderId, orderId);
        assert(searchTradeResult.jobCd, GMO.Util.JOB_CD_SALES);
    });

    it('すでに実売上済みなのでOK', async () => {
        const orderId = Date.now().toString();
        const shopId = 'tshop00026096';
        const shopPass = 'xbxmkaa6';
        const amount = 1234;

        const entryTranResult = await GMO.CreditService.entryTran({
            shopId: shopId,
            shopPass: shopPass,
            orderId: orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: amount
        });

        await GMO.CreditService.execTran({
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            orderId: orderId,
            method: '1',
            cardNo: '4111111111111111',
            expire: '2012',
            securityCode: '123'
        });

        await GMO.CreditService.alterTran({
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

        await SalesService.settleGMOAuth(authorization)();
    });
});
