/**
 * レポートサービステスト
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');

import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('service.report.searchTelemetries()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('DBが正常であれば、配列を取得できるはず', async () => {
        const conditions = {};
        const telemetries = [];
        const telemetryRepo = new sskts.repository.Telemetry(sskts.mongoose.connection);

        sandbox.mock(telemetryRepo.telemetryModel).expects('find').once()
            .chain('sort').chain('lean').chain('exec').resolves(telemetries);

        const result = await sskts.service.report.searchTelemetries(<any>conditions)(telemetryRepo);

        assert(Array.isArray(result));
        sandbox.verify();
    });
});

// describe('service.report.createTelemetry()', () => {
//     afterEach(() => {
//         sandbox.restore();
//     });

//     it('DBが正常であれば、エラーにならないはず', async () => {
//         const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
//         const telemetryRepo = new sskts.repository.Telemetry(sskts.mongoose.connection);
//         const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

//         sandbox.mock(taskRepo.taskModel).expects('count').atLeast(1)
//             .chain('exec').resolves(1);
//         sandbox.mock(transactionRepo.transactionModel).expects('count').atLeast(1)
//             .chain('exec').resolves(1);
//         sandbox.mock(taskRepo.taskModel).expects('find').atLeast(1)
//             .chain('exec').resolves([]);
//         sandbox.mock(transactionRepo.transactionModel).expects('find').atLeast(1)
//             .chain('exec').resolves([]);
//         sandbox.mock(telemetryRepo.telemetryModel).expects('create').once().resolves({});

//         const result = await sskts.service.report.createTelemetry()(taskRepo, telemetryRepo, transactionRepo);

//         assert.equal(result, undefined);
//         sandbox.verify();
//     });
// });

describe('service.report.checkHealthOfGMOSales()', () => {
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
            payType: 'payType'
        }];
        const transactions = [{
            object: {
                authorizeActions: [{
                    object: {
                        orderId: 'orderId',
                        payType: 'payType',
                        amount: 1234
                    },
                    result: {
                        execTranArgs: {
                            accessId: 'accessId'
                        }
                    }
                }]
            }
        }];
        const gmoNotificationRepo = new sskts.repository.GMONotification(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(gmoNotificationRepo.gmoNotificationModel).expects('find').once()
            .chain('lean').chain('exec').resolves(notifications);
        sandbox.mock(transactionRepo.transactionModel).expects('find').once()
            .chain('lean').chain('exec').resolves(transactions);

        const result = await sskts.service.report.checkHealthOfGMOSales(madeFrom, madeThrough)(gmoNotificationRepo, transactionRepo);
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
            payType: 'payType'
        }];
        const transactions = [{
            object: {
                authorizeActions: [{
                    object: {
                        payType: 'payType',
                        amount: 1234
                    },
                    result: {
                        execTranArgs: {
                            accessId: 'accessId'
                        }
                    }
                }]
            }
        }];
        const gmoNotificationRepo = new sskts.repository.GMONotification(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(gmoNotificationRepo.gmoNotificationModel).expects('find').once()
            .chain('lean').chain('exec').resolves(notifications);
        sandbox.mock(transactionRepo.transactionModel).expects('find').once()
            .chain('lean').chain('exec').resolves(transactions);

        const result = await sskts.service.report.checkHealthOfGMOSales(madeFrom, madeThrough)(gmoNotificationRepo, transactionRepo);
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
        const transactions = [{
            object: {
                authorizeActions: [{
                    object: {
                        orderId: 'orderId',
                        payType: 'payType',
                        amount: 1234
                    },
                    result: {
                        execTranArgs: {
                            accessId: 'accessId'
                        }
                    }
                }]
            }
        }];
        const gmoNotificationRepo = new sskts.repository.GMONotification(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(gmoNotificationRepo.gmoNotificationModel).expects('find').once()
            .chain('lean').chain('exec').resolves(notifications);
        sandbox.mock(transactionRepo.transactionModel).expects('find').once()
            .chain('lean').chain('exec').resolves(transactions);

        const result = await sskts.service.report.checkHealthOfGMOSales(madeFrom, madeThrough)(gmoNotificationRepo, transactionRepo);
        assert.equal(typeof result, 'object');
        assert.equal(result.unhealthGMOSales.length, 1);
        sandbox.verify();
    });

    it('決済方法が異なれば不健康なはず', async () => {
        const madeFrom = new Date();
        const madeThrough = new Date();
        const notifications = [{
            accessId: 'accessId',
            orderId: 'orderId',
            status: 'status',
            jobCd: 'jobCd',
            amount: 1234,
            payType: 'invalidPayType'
        }];
        const transactions = [{
            object: {
                authorizeActions: [{
                    object: {
                        orderId: 'orderId',
                        payType: 'payType',
                        amount: 1234
                    },
                    result: {
                        execTranArgs: {
                            accessId: 'accessId'
                        }
                    }
                }]
            }
        }];
        const gmoNotificationRepo = new sskts.repository.GMONotification(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(gmoNotificationRepo.gmoNotificationModel).expects('find').once()
            .chain('lean').chain('exec').resolves(notifications);
        sandbox.mock(transactionRepo.transactionModel).expects('find').once()
            .chain('lean').chain('exec').resolves(transactions);

        const result = await sskts.service.report.checkHealthOfGMOSales(madeFrom, madeThrough)(gmoNotificationRepo, transactionRepo);
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
        const transactions = [{
            object: {
                authorizeActions: [{
                    object: {
                        orderId: 'orderId',
                        payType: 'payType',
                        amount: 1234
                    },
                    result: {
                        execTranArgs: {
                            accessId: 'accessId'
                        }
                    }
                }]
            }
        }];
        const gmoNotificationRepo = new sskts.repository.GMONotification(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(gmoNotificationRepo.gmoNotificationModel).expects('find').once()
            .chain('lean').chain('exec').resolves(notifications);
        sandbox.mock(transactionRepo.transactionModel).expects('find').once()
            .chain('lean').chain('exec').resolves(transactions);

        const result = await sskts.service.report.checkHealthOfGMOSales(madeFrom, madeThrough)(gmoNotificationRepo, transactionRepo);
        assert.equal(typeof result, 'object');
        assert.equal(result.unhealthGMOSales.length, 1);
        sandbox.verify();
    });
});
