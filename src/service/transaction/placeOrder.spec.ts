// tslint:disable:no-implicit-dependencies
/**
 * placeOrder transaction service test
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

describe('exportTasks()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('非対応ステータスであれば、Argumentエラーになるはず', async () => {
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        const status = sskts.factory.transactionStatusType.InProgress;
        const transactionDoc = new transactionRepo.transactionModel();
        transactionDoc.set('status', status);

        sandbox.mock(transactionRepo.transactionModel).expects('findOneAndUpdate').never();
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').never();
        sandbox.mock(taskRepo).expects('save').never();
        sandbox.mock(transactionRepo).expects('setTasksExportedById').never();

        const result = await sskts.service.transaction.placeOrder.exportTasks(
            status
        )(taskRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });

    it('タスクエクスポート待ちの取引があれば、エクスポートされるはず', async () => {
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        const status = sskts.factory.transactionStatusType.Confirmed;
        const task = {};
        const transactionDoc = new transactionRepo.transactionModel();
        transactionDoc.set('status', status);

        sandbox.mock(transactionRepo.transactionModel).expects('findOneAndUpdate').once()
            .withArgs({
                typeOf: sskts.factory.transactionType.PlaceOrder,
                status: status,
                tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported
            }).chain('exec').resolves(transactionDoc);
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once().resolves(transactionDoc);
        sandbox.mock(taskRepo).expects('save').atLeast(1).resolves(task);
        sandbox.mock(transactionRepo).expects('setTasksExportedById').once().withArgs(transactionDoc.id).resolves();

        const result = await sskts.service.transaction.placeOrder.exportTasks(
            status
        )(taskRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('タスクエクスポート待ちの取引がなければ、何もしないはず', async () => {
        const status = sskts.factory.transactionStatusType.Confirmed;
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo.transactionModel).expects('findOneAndUpdate').once()
            .withArgs({
                typeOf: sskts.factory.transactionType.PlaceOrder,
                status: status,
                tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported
            }).chain('exec').resolves(null);
        sandbox.mock(sskts.service.transaction.placeOrder).expects('exportTasksById').never();
        sandbox.mock(transactionRepo).expects('setTasksExportedById').never();

        const result = await sskts.service.transaction.placeOrder.exportTasks(
            status
        )(taskRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('exportTasksById()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('確定取引であれば1つのタスクがエクスポートされるはず', async () => {
        const numberOfTasks = 1;
        const transaction = {
            id: 'transactionId',
            status: sskts.factory.transactionStatusType.Confirmed
        };
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(taskRepo).expects('save').exactly(numberOfTasks).resolves();

        const result = await sskts.service.transaction.placeOrder.exportTasksById(
            transaction.id
        )(taskRepo, transactionRepo);

        assert(Array.isArray(result));
        assert.equal(result.length, numberOfTasks);
        sandbox.verify();
    });

    it('期限切れ取引であれば3つのタスクがエクスポートされるはず', async () => {
        const numberOfTasks = 3;
        const transaction = {
            id: 'transactionId',
            status: sskts.factory.transactionStatusType.Expired
        };
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(taskRepo).expects('save').exactly(numberOfTasks).resolves();

        const result = await sskts.service.transaction.placeOrder.exportTasksById(
            transaction.id
        )(taskRepo, transactionRepo);

        assert(Array.isArray(result));
        assert.equal(result.length, numberOfTasks);
        sandbox.verify();
    });

    it('非対応ステータスの取引であれば、NotImplementedエラーになるはず', async () => {
        const transaction = {
            id: 'transactionId',
            status: sskts.factory.transactionStatusType.InProgress
        };
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.transaction.placeOrder.exportTasksById(
            transaction.id
        )(taskRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.NotImplemented);
        sandbox.verify();
    });
});

describe('sendEmail', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('DBが正常であれば、タスクが登録されるはず', async () => {
        const transaction = {
            id: 'id',
            status: sskts.factory.transactionStatusType.Confirmed,
            seller: {},
            agent: {}
        };
        const emailMessageAttributes = {
            sender: { name: 'name', email: 'test@example.com' },
            toRecipient: { name: 'name', email: 'test@example.com' },
            about: 'about',
            text: 'text'
        };
        const task = {};

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(taskRepo).expects('save').once().resolves(task);

        const result = await sskts.service.transaction.placeOrder.sendEmail(
            transaction.id,
            <any>emailMessageAttributes
        )(taskRepo, transactionRepo);

        assert(typeof result === 'object');
        sandbox.verify();
    });

    it('取引ステータスが確定済でなければ、Forbiddenエラーになるはず', async () => {
        const transaction = {
            id: 'id',
            status: sskts.factory.transactionStatusType.InProgress,
            seller: {},
            agent: {}
        };
        const emailMessageAttributes = {
            sender: { name: 'name', email: 'test@example.com' },
            toRecipient: { name: 'name', email: 'test@example.com' },
            about: 'about',
            text: 'text'
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.transaction.placeOrder.sendEmail(
            transaction.id,
            <any>emailMessageAttributes
        )(taskRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});

describe('download', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('DBが正常であれば、成立取引をダウンロードできるはず', async () => {
        const conditions = {
            startFrom: new Date(),
            startThrough: new Date()
        };
        const transactions = [{
            id: 'id',
            status: sskts.factory.transactionStatusType.Confirmed,
            seller: {},
            agent: {},
            startDate: new Date(),
            endDate: new Date(),
            object: {
                customerContact: {}
            },
            result: {
                order: {
                    confirmationNumber: 123,
                    acceptedOffers: [{
                        itemOffered: {
                            reservationFor: {
                                superEvent: {
                                    workPerformed: {},
                                    location: {
                                        name: {}
                                    }
                                },
                                startDate: new Date(),
                                endDate: new Date(),
                                location: {
                                    name: {}
                                }
                            },
                            reservedTicket: {
                                ticketedSeat: {},
                                coaTicketInfo: {}
                            }
                        }
                    }],
                    paymentMethods: [{
                        name: 'name',
                        paymentMethodId: 'paymentMethodId'
                    }],
                    discounts: [{
                        name: 'name',
                        discountCode: 'discountCode',
                        discount: 123
                    }]
                }
            }
        }];

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('searchPlaceOrder').once().resolves(transactions);

        const result = await sskts.service.transaction.placeOrder.download(
            conditions,
            'csv'
        )(transactionRepo);

        assert(typeof result === 'string');
        sandbox.verify();
    });

    it('undefined属性は空文字列としてcsvに補完されるはず', async () => {
        const conditions = {
            startFrom: new Date(),
            startThrough: new Date()
        };
        const transactions = [
            {
                id: 'id',
                status: sskts.factory.transactionStatusType.Confirmed,
                seller: {},
                agent: {},
                object: {
                    customerContact: {}
                },
                result: {
                    order: {
                        confirmationNumber: 123,
                        acceptedOffers: [{
                            itemOffered: {
                                reservationFor: {
                                    superEvent: {
                                        workPerformed: {},
                                        location: {
                                            name: {}
                                        }
                                    },
                                    startDate: new Date(),
                                    endDate: new Date(),
                                    location: {
                                        name: {}
                                    }
                                },
                                reservedTicket: {
                                    ticketedSeat: {},
                                    coaTicketInfo: {}
                                }
                            }
                        }],
                        paymentMethods: [{
                            name: 'name',
                            paymentMethodId: 'paymentMethodId'
                        }],
                        discounts: [{
                            name: 'name',
                            discountCode: 'discountCode',
                            discount: 123
                        }]
                    }
                }
            },
            {
                id: 'id',
                status: sskts.factory.transactionStatusType.Expired,
                seller: {},
                agent: {
                    memberOf: { membershipNumber: 'membershipNumber' }
                },
                object: {
                }
            },
            {
                id: 'id',
                status: sskts.factory.transactionStatusType.Expired,
                seller: {},
                agent: {},
                object: {
                }
            }
        ];

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('searchPlaceOrder').once().resolves(transactions);

        const result = await sskts.service.transaction.placeOrder.download(
            conditions,
            'csv'
        )(transactionRepo);

        assert(typeof result === 'string');
        sandbox.verify();
    });

    it('DBが正常であれば、成立以外の取引をダウンロードできるはず', async () => {
        const conditions = {
            startFrom: new Date(),
            startThrough: new Date()
        };
        const transactions = [{
            id: 'id',
            status: sskts.factory.transactionStatusType.Confirmed,
            seller: {},
            agent: {},
            startDate: new Date(),
            endDate: new Date(),
            object: {
                customerContact: {}
            }
        }];

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('searchPlaceOrder').once().resolves(transactions);

        const result = await sskts.service.transaction.placeOrder.download(
            conditions,
            'csv'
        )(transactionRepo);

        assert(typeof result === 'string');
        sandbox.verify();
    });

    it('非対応フォーマットを指定すればNotImplementedエラーとなるはず', async () => {
        const conditions = {
            startFrom: new Date(),
            startThrough: new Date()
        };
        const transactions = [];

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('searchPlaceOrder').once().resolves(transactions);

        const result = await sskts.service.transaction.placeOrder.download(
            conditions,
            <any>'invalidformat'
        )(transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotImplemented);
        sandbox.verify();
    });
});
