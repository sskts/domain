// tslint:disable:no-implicit-dependencies

/**
 * 健康レポートサービステスト
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');

import * as sskts from '../../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('service.report.health.checkGMOSales()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('全て健康であれば、不健康リストはないはず', async () => {
        const madeFrom = new Date();
        const madeThrough = new Date();
        const notifications = [{
            accessId: 'accessId',
            orderId: 'orderId',
            status: 'status',
            jobCd: 'jobCd',
            amount: 1234,
            payType: 'payType',
            approve: 'approve'
        }];
        const actions = [{
            object: {
                paymentMethod: {
                    paymentMethodId: 'orderId',
                },
                price: 1234
            },
            result: {
                creditCardSales: {
                    accessId: 'accessId',
                    approve: 'approve'
                }
            }
        }];
        const gmoNotificationRepo = new sskts.repository.GMONotification(sskts.mongoose.connection);
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);

        sandbox.mock(gmoNotificationRepo.gmoNotificationModel).expects('find').once()
            .chain('lean').chain('exec').resolves(notifications);
        sandbox.mock(actionRepo.actionModel).expects('find').once()
            .chain('exec').resolves(actions.map((a) => new actionRepo.actionModel(a)));

        const result = await sskts.service.report.health.checkGMOSales(madeFrom, madeThrough)(gmoNotificationRepo, actionRepo);
        assert.equal(typeof result, 'object');
        assert.equal(result.unhealthGMOSales.length, 0);
        sandbox.verify();
    });

    it('オーダーIDに該当する取引がなければ不健康なはず', async () => {
        const madeFrom = new Date();
        const madeThrough = new Date();
        const notifications = [{
            accessId: 'accessId',
            orderId: 'orderId',
            status: 'status',
            jobCd: 'jobCd',
            amount: 1234,
            payType: 'payType',
            approve: 'approve'
        }];
        const actions = [{
            object: {
                paymentMethod: {
                    paymentMethodId: 'paymentMethodId',
                },
                price: 1234
            },
            result: {
                creditCardSales: {
                    accessId: 'accessId',
                    approve: 'approve'
                }
            }
        }];
        const gmoNotificationRepo = new sskts.repository.GMONotification(sskts.mongoose.connection);
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);

        sandbox.mock(gmoNotificationRepo.gmoNotificationModel).expects('find').once()
            .chain('lean').chain('exec').resolves(notifications);
        sandbox.mock(actionRepo.actionModel).expects('find').once()
            .chain('exec').resolves(actions.map((a) => new actionRepo.actionModel(a)));

        const result = await sskts.service.report.health.checkGMOSales(madeFrom, madeThrough)(gmoNotificationRepo, actionRepo);
        assert.equal(typeof result, 'object');
        assert.equal(result.unhealthGMOSales.length, 1);
        sandbox.verify();
    });

    it('アクセスIDが異なれば不健康なはず', async () => {
        const madeFrom = new Date();
        const madeThrough = new Date();
        const notifications = [{
            accessId: 'invalidAccessId',
            orderId: 'orderId',
            status: 'status',
            jobCd: 'jobCd',
            amount: 1234,
            payType: 'payType'
        }];
        const actions = [{
            object: {
                paymentMethod: {
                    paymentMethodId: 'orderId',
                },
                price: 1234
            },
            result: {
                creditCardSales: {
                    accessId: 'invalid',
                    approve: 'approve'
                }
            }
        }];
        const gmoNotificationRepo = new sskts.repository.GMONotification(sskts.mongoose.connection);
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);

        sandbox.mock(gmoNotificationRepo.gmoNotificationModel).expects('find').once()
            .chain('lean').chain('exec').resolves(notifications);
        sandbox.mock(actionRepo.actionModel).expects('find').once()
            .chain('exec').resolves(actions.map((a) => new actionRepo.actionModel(a)));

        const result = await sskts.service.report.health.checkGMOSales(madeFrom, madeThrough)(gmoNotificationRepo, actionRepo);
        assert.equal(typeof result, 'object');
        assert.equal(result.unhealthGMOSales.length, 1);
        sandbox.verify();
    });

    it('金額が異なれば不健康なはず', async () => {
        const madeFrom = new Date();
        const madeThrough = new Date();
        const notifications = [{
            accessId: 'accessId',
            orderId: 'orderId',
            status: 'status',
            jobCd: 'jobCd',
            amount: 9999,
            payType: 'payType'
        }];
        const actions = [{
            object: {
                paymentMethod: {
                    paymentMethodId: 'orderId',
                },
                price: 123
            },
            result: {
                creditCardSales: {
                    accessId: 'accessId',
                    approve: 'approve'
                }
            }
        }];
        const gmoNotificationRepo = new sskts.repository.GMONotification(sskts.mongoose.connection);
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);

        sandbox.mock(gmoNotificationRepo.gmoNotificationModel).expects('find').once()
            .chain('lean').chain('exec').resolves(notifications);
        sandbox.mock(actionRepo.actionModel).expects('find').once()
            .chain('exec').resolves(actions.map((a) => new actionRepo.actionModel(a)));

        const result = await sskts.service.report.health.checkGMOSales(madeFrom, madeThrough)(gmoNotificationRepo, actionRepo);
        assert.equal(typeof result, 'object');
        assert.equal(result.unhealthGMOSales.length, 1);
        sandbox.verify();
    });
});
