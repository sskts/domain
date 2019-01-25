// tslint:disable:no-implicit-dependencies
/**
 * 注文返品取引サービステスト
 */
import * as assert from 'power-assert';
import * as pug from 'pug';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');
import * as sskts from '../../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.createSandbox();
});

describe('service.transaction.returnOrder.start()', () => {
    beforeEach(() => {
        // no op
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('条件がそろっていれば取引を開始できるはず', async () => {
        const agent = { id: 'agentId' };
        const event = { startDate: new Date() };
        const order = {
            orderNumber: 'orderNumber',
            orderStatus: sskts.factory.orderStatus.OrderDelivered,
            acceptedOffers: [
                { itemOffered: { reservationFor: event } }
            ]
        };
        const placeOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            status: sskts.factory.transactionStatusType.Confirmed,
            result: {
                order: order,
                ownershipInfos: []
            }
        };
        const returnOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction }
        };
        const actionsOnOrder = [
            {
                typeOf: sskts.factory.actionType.PayAction,
                actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                object: {
                    paymentMethodType: sskts.factory.paymentMethodType.CreditCard
                }
            }
        ];

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(placeOrderTransaction);
        sandbox.mock(orderRepo).expects('findByOrderNumber').once()
            .withArgs(order.orderNumber).resolves(order);
        sandbox.mock(actionRepo).expects('findByOrderNumber').once()
            .withArgs(order.orderNumber).resolves(actionsOnOrder);
        sandbox.mock(transactionRepo).expects('start').once().resolves(returnOrderTransaction);

        const result = await sskts.service.transaction.returnOrder.start({
            expires: returnOrderTransaction.expires,
            clientUser: <any>{},
            agentId: agent.id,
            transactionId: returnOrderTransaction.id,
            cancellationFee: 0,
            forcibly: false,
            reason: sskts.factory.transaction.returnOrder.Reason.Seller
        })({
            action: actionRepo,
            transaction: transactionRepo,
            order: orderRepo
        });

        assert.equal(typeof result, 'object');
        sandbox.verify();
    });

    it('注文取引のステータスがConfirmedでなければArgumentエラーとなるはず', async () => {
        const agent = { id: 'agentId' };
        const event = { startDate: new Date() };
        const order = {
            orderNumber: 'orderNumber',
            orderStatus: sskts.factory.orderStatus.OrderDelivered,
            acceptedOffers: [
                { itemOffered: { reservationFor: event } }
            ]
        };
        const placeOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            status: sskts.factory.transactionStatusType.InProgress,
            result: {
                order: order,
                ownershipInfos: []
            }
        };
        const returnOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction }
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(placeOrderTransaction);
        sandbox.mock(orderRepo).expects('findByOrderNumber').never();
        sandbox.mock(actionRepo).expects('findByOrderNumber').never();
        sandbox.mock(transactionRepo).expects('start').never();

        const result = await sskts.service.transaction.returnOrder.start({
            expires: returnOrderTransaction.expires,
            clientUser: <any>{},
            agentId: agent.id,
            transactionId: returnOrderTransaction.id,
            cancellationFee: 0,
            forcibly: true,
            reason: sskts.factory.transaction.returnOrder.Reason.Seller
        })({
            action: actionRepo,
            transaction: transactionRepo,
            order: orderRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });

    it('注文取引結果が未定義であればNotFoundエラーとなるはず', async () => {
        const agent = { id: 'agentId' };
        const placeOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            status: sskts.factory.transactionStatusType.Confirmed
            // result: {
            //     order: order,
            //     ownershipInfos: []
            // }
        };
        const returnOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction }
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(placeOrderTransaction);
        sandbox.mock(orderRepo).expects('findByOrderNumber').never();
        sandbox.mock(actionRepo).expects('findByOrderNumber').never();
        sandbox.mock(transactionRepo).expects('start').never();

        const result = await sskts.service.transaction.returnOrder.start({
            expires: returnOrderTransaction.expires,
            clientUser: <any>{},
            agentId: agent.id,
            transactionId: returnOrderTransaction.id,
            cancellationFee: 0,
            forcibly: true,
            reason: sskts.factory.transaction.returnOrder.Reason.Seller
        })({
            action: actionRepo,
            transaction: transactionRepo,
            order: orderRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('注文のステータスが配送済でなければArgumentエラーとなるはず', async () => {
        const agent = { id: 'agentId' };
        const event = { startDate: new Date() };
        const order = {
            orderNumber: 'orderNumber',
            orderStatus: sskts.factory.orderStatus.OrderProcessing,
            acceptedOffers: [
                { itemOffered: { reservationFor: event } }
            ]
        };
        const placeOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            status: sskts.factory.transactionStatusType.Confirmed,
            result: {
                order: order,
                ownershipInfos: []
            }
        };
        const returnOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction }
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(placeOrderTransaction);
        sandbox.mock(orderRepo).expects('findByOrderNumber').once().resolves(order);
        sandbox.mock(actionRepo).expects('findByOrderNumber').never();
        sandbox.mock(transactionRepo).expects('start').never();

        const result = await sskts.service.transaction.returnOrder.start({
            expires: returnOrderTransaction.expires,
            clientUser: <any>{},
            agentId: agent.id,
            transactionId: returnOrderTransaction.id,
            cancellationFee: 0,
            forcibly: true,
            reason: sskts.factory.transaction.returnOrder.Reason.Seller
        })({
            action: actionRepo,
            transaction: transactionRepo,
            order: orderRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });

    it('支払アクションがなければNotFoundエラーとなるはず', async () => {
        const agent = { id: 'agentId' };
        const event = { startDate: new Date() };
        const order = {
            orderNumber: 'orderNumber',
            orderStatus: sskts.factory.orderStatus.OrderDelivered,
            acceptedOffers: [
                { itemOffered: { reservationFor: event } }
            ]
        };
        const placeOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            status: sskts.factory.transactionStatusType.Confirmed,
            result: {
                order: order,
                ownershipInfos: []
            }
        };
        const returnOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction }
        };
        const actionsOnOrder: any[] = [];

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(placeOrderTransaction);
        sandbox.mock(orderRepo).expects('findByOrderNumber').once()
            .withArgs(order.orderNumber).resolves(order);
        sandbox.mock(actionRepo).expects('findByOrderNumber').once()
            .withArgs(order.orderNumber).resolves(actionsOnOrder);
        sandbox.mock(transactionRepo).expects('start').never();

        const result = await sskts.service.transaction.returnOrder.start({
            expires: returnOrderTransaction.expires,
            clientUser: <any>{},
            agentId: agent.id,
            transactionId: returnOrderTransaction.id,
            cancellationFee: 0,
            forcibly: true,
            reason: sskts.factory.transaction.returnOrder.Reason.Seller
        })({
            action: actionRepo,
            transaction: transactionRepo,
            order: orderRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('取引開始に失敗すればそのままエラーとなるはず', async () => {
        const agent = { id: 'agentId' };
        const event = { startDate: new Date() };
        const order = {
            orderNumber: 'orderNumber',
            orderStatus: sskts.factory.orderStatus.OrderDelivered,
            acceptedOffers: [
                { itemOffered: { reservationFor: event } }
            ]
        };
        const placeOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            status: sskts.factory.transactionStatusType.Confirmed,
            result: {
                order: order,
                ownershipInfos: []
            }
        };
        const returnOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction }
        };
        const actionsOnOrder = [
            {
                typeOf: sskts.factory.actionType.PayAction,
                actionStatus: sskts.factory.actionStatusType.CompletedActionStatus
            }
        ];
        const startTransactionResult = new Error('startTransactionError');

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(placeOrderTransaction);
        sandbox.mock(orderRepo).expects('findByOrderNumber').once()
            .withArgs(order.orderNumber).resolves(order);
        sandbox.mock(actionRepo).expects('findByOrderNumber').once()
            .withArgs(order.orderNumber).resolves(actionsOnOrder);
        sandbox.mock(transactionRepo).expects('start').once().rejects(startTransactionResult);

        const result = await sskts.service.transaction.returnOrder.start({
            expires: returnOrderTransaction.expires,
            clientUser: <any>{},
            agentId: agent.id,
            transactionId: returnOrderTransaction.id,
            cancellationFee: 0,
            forcibly: false,
            reason: sskts.factory.transaction.returnOrder.Reason.Seller
        })({
            action: actionRepo,
            transaction: transactionRepo,
            order: orderRepo
        }).catch((err) => err);

        assert.deepEqual(result, startTransactionResult);
        sandbox.verify();
    });

    it('同一注文取引に対する返品が重複すればAlreadyInUseエラーとなるはず', async () => {
        const agent = { id: 'agentId' };
        const event = { startDate: new Date() };
        const order = {
            orderNumber: 'orderNumber',
            orderStatus: sskts.factory.orderStatus.OrderDelivered,
            acceptedOffers: [
                { itemOffered: { reservationFor: event } }
            ]
        };
        const placeOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            status: sskts.factory.transactionStatusType.Confirmed,
            result: {
                order: order,
                ownershipInfos: []
            }
        };
        const returnOrderTransaction = {
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction }
        };
        const actionsOnOrder = [
            {
                typeOf: sskts.factory.actionType.PayAction,
                actionStatus: sskts.factory.actionStatusType.CompletedActionStatus
            }
        ];
        const startTransactionResult = new Error('startTransactionError');
        startTransactionResult.name = 'MongoError';
        // tslint:disable-next-line:no-magic-numbers
        (<any>startTransactionResult).code = 11000;

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(placeOrderTransaction);
        sandbox.mock(orderRepo).expects('findByOrderNumber').once()
            .withArgs(order.orderNumber).resolves(order);
        sandbox.mock(actionRepo).expects('findByOrderNumber').once()
            .withArgs(order.orderNumber).resolves(actionsOnOrder);
        sandbox.mock(transactionRepo).expects('start').once().rejects(startTransactionResult);

        const result = await sskts.service.transaction.returnOrder.start({
            expires: returnOrderTransaction.expires,
            clientUser: <any>{},
            agentId: agent.id,
            transactionId: returnOrderTransaction.id,
            cancellationFee: 0,
            forcibly: false,
            reason: sskts.factory.transaction.returnOrder.Reason.Seller
        })({
            action: actionRepo,
            transaction: transactionRepo,
            order: orderRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.AlreadyInUse);
        sandbox.verify();
    });
});

describe('service.transaction.returnOrder.confirm()', () => {
    beforeEach(() => {
        // no op
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('条件がそろっていれば取引を確定できるはず', async () => {
        const agent = { id: 'agentId' };
        const seller = { id: 'sellerId', name: {} };
        const event = { startDate: new Date() };
        const order = {
            orderNumber: 'orderNumber',
            orderStatus: sskts.factory.orderStatus.OrderDelivered,
            acceptedOffers: [
                { itemOffered: { reservationFor: event } }
            ],
            seller: seller,
            customer: {}
        };
        const placeOrderTransaction = {
            agent: agent,
            id: 'transactionId',
            expires: new Date(),
            status: sskts.factory.transactionStatusType.Confirmed,
            object: {
                customerContact: { email: 'test@example.com' },
                authorizeActions: []
            },
            result: {
                order: order,
                ownershipInfos: []
            },
            seller: seller
        };
        const returnOrderTransaction = {
            agent: agent,
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction }
        };
        const actionsOnOrder = [
            {
                typeOf: sskts.factory.actionType.PayAction,
                actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                object: [{
                    paymentMethod: {
                        paymentMethod: sskts.factory.paymentMethodType.CreditCard
                    }
                }]
            }
        ];

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(returnOrderTransaction);
        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(actionRepo).expects('findByOrderNumber').once()
            .withArgs(order.orderNumber).resolves(actionsOnOrder);
        sandbox.mock(transactionRepo).expects('confirmReturnOrder').once().resolves(returnOrderTransaction);

        const result = await sskts.service.transaction.returnOrder.confirm(
            agent.id,
            returnOrderTransaction.id
        )({
            action: actionRepo,
            transaction: transactionRepo,
            organization: organizationRepo
        });

        assert.equal(typeof result, 'object');
        sandbox.verify();
    });

    it('取引主体が開始時と異なればForbiddenエラーとなるはず', async () => {
        const agent = { id: 'agentId' };
        const seller = { id: 'sellerId' };
        const event = { startDate: new Date() };
        const order = {
            orderNumber: 'orderNumber',
            orderStatus: sskts.factory.orderStatus.OrderDelivered,
            acceptedOffers: [
                { itemOffered: { reservationFor: event } }
            ],
            seller: seller,
            customer: {}
        };
        const placeOrderTransaction = {
            agent: agent,
            id: 'transactionId',
            expires: new Date(),
            status: sskts.factory.transactionStatusType.Confirmed,
            object: {
                customerContact: { email: 'test@example.com' }
            },
            result: {
                order: order,
                ownershipInfos: []
            },
            seller: seller
        };
        const returnOrderTransaction = {
            agent: agent,
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction }
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(returnOrderTransaction);
        sandbox.mock(organizationRepo).expects('findById').never();
        sandbox.mock(actionRepo).expects('findByOrderNumber').never();
        sandbox.mock(transactionRepo).expects('confirmReturnOrder').never();

        const result = await sskts.service.transaction.returnOrder.confirm(
            'invalidAgentId',
            returnOrderTransaction.id
        )({
            action: actionRepo,
            transaction: transactionRepo,
            organization: organizationRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });

    it('注文取引結果がなければNotFoundエラーとなるはず', async () => {
        const agent = { id: 'agentId' };
        const seller = { id: 'sellerId' };
        const placeOrderTransaction = {
            agent: agent,
            id: 'transactionId',
            expires: new Date(),
            status: sskts.factory.transactionStatusType.Confirmed,
            object: {
                customerContact: { email: 'test@example.com' }
            },
            // result: {
            //     order: order,
            //     ownershipInfos: []
            // },
            seller: seller
        };
        const returnOrderTransaction = {
            agent: agent,
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction }
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(returnOrderTransaction);
        sandbox.mock(organizationRepo).expects('findById').never();
        sandbox.mock(actionRepo).expects('findByOrderNumber').never();
        sandbox.mock(transactionRepo).expects('confirmReturnOrder').never();

        const result = await sskts.service.transaction.returnOrder.confirm(
            agent.id,
            returnOrderTransaction.id
        )({
            action: actionRepo,
            transaction: transactionRepo,
            organization: organizationRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('注文取引の購入者連絡先がなければNotFoundエラーとなるはず', async () => {
        const agent = { id: 'agentId' };
        const seller = { id: 'sellerId' };
        const event = { startDate: new Date() };
        const order = {
            orderNumber: 'orderNumber',
            orderStatus: sskts.factory.orderStatus.OrderDelivered,
            acceptedOffers: [
                { itemOffered: { reservationFor: event } }
            ],
            seller: seller,
            customer: {}
        };
        const placeOrderTransaction = {
            agent: agent,
            id: 'transactionId',
            expires: new Date(),
            status: sskts.factory.transactionStatusType.Confirmed,
            object: {
                // customerContact: { email: 'test@example.com' }
            },
            result: {
                order: order,
                ownershipInfos: []
            },
            seller: seller
        };
        const returnOrderTransaction = {
            agent: agent,
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction }
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(returnOrderTransaction);
        sandbox.mock(organizationRepo).expects('findById').never();
        sandbox.mock(actionRepo).expects('findByOrderNumber').never();
        sandbox.mock(transactionRepo).expects('confirmReturnOrder').never();

        const result = await sskts.service.transaction.returnOrder.confirm(
            agent.id,
            returnOrderTransaction.id
        )({
            action: actionRepo,
            transaction: transactionRepo,
            organization: organizationRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('支払アクションがなければNotFoundエラーとなるはず', async () => {
        const agent = { id: 'agentId' };
        const seller = { id: 'sellerId' };
        const event = { startDate: new Date() };
        const order = {
            orderNumber: 'orderNumber',
            orderStatus: sskts.factory.orderStatus.OrderDelivered,
            acceptedOffers: [
                { itemOffered: { reservationFor: event } }
            ],
            seller: seller,
            customer: {}
        };
        const placeOrderTransaction = {
            agent: agent,
            id: 'transactionId',
            expires: new Date(),
            status: sskts.factory.transactionStatusType.Confirmed,
            object: {
                customerContact: { email: 'test@example.com' }
            },
            result: {
                order: order,
                ownershipInfos: []
            },
            seller: seller
        };
        const returnOrderTransaction = {
            agent: agent,
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction }
        };
        const actionsOnOrder: any[] = [];

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(returnOrderTransaction);
        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(actionRepo).expects('findByOrderNumber').once().withArgs(order.orderNumber).resolves(actionsOnOrder);
        sandbox.mock(transactionRepo).expects('confirmReturnOrder').never();

        const result = await sskts.service.transaction.returnOrder.confirm(
            agent.id,
            returnOrderTransaction.id
        )({
            action: actionRepo,
            transaction: transactionRepo,
            organization: organizationRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });
});

describe('service.transaction.returnOrder.exportTasks()', () => {
    beforeEach(() => {
        // no op
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('成立取引のタスクを出力できるはず', async () => {
        const status = sskts.factory.transactionStatusType.Confirmed;
        const agent = { id: 'agentId' };
        const placeOrderTransaction = {};
        const returnOrderTransaction = {
            agent: agent,
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction },
            status: status
        };
        const task = {};

        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('startExportTasks').once().resolves(returnOrderTransaction);
        sandbox.mock(transactionRepo).expects('findById').once().resolves(returnOrderTransaction);
        sandbox.mock(taskRepo).expects('save').once().resolves(task);
        sandbox.mock(transactionRepo).expects('setTasksExportedById').once().withArgs(returnOrderTransaction.id).resolves();

        const result = await sskts.service.transaction.returnOrder.exportTasks(status)({
            task: taskRepo,
            transaction: transactionRepo
        });

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('期限切れ取引のタスクを出力できるはず', async () => {
        const status = sskts.factory.transactionStatusType.Expired;
        const agent = { id: 'agentId' };
        const placeOrderTransaction = {};
        const returnOrderTransaction = {
            agent: agent,
            id: 'transactionId',
            expires: new Date(),
            object: { transaction: placeOrderTransaction },
            status: status
        };

        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('startExportTasks').once().resolves(returnOrderTransaction);
        sandbox.mock(transactionRepo).expects('findById').once().resolves(returnOrderTransaction);
        sandbox.mock(taskRepo).expects('save').never();
        sandbox.mock(transactionRepo).expects('setTasksExportedById').once().withArgs(returnOrderTransaction.id).resolves();

        const result = await sskts.service.transaction.returnOrder.exportTasks(status)({
            task: taskRepo,
            transaction: transactionRepo
        });

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('タスク未出力の取引がなければ何もしない', async () => {
        const status = sskts.factory.transactionStatusType.Expired;

        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('startExportTasks').once().resolves(null);
        sandbox.mock(transactionRepo).expects('findById').never();
        sandbox.mock(taskRepo).expects('save').never();
        sandbox.mock(transactionRepo).expects('setTasksExportedById').never();

        const result = await sskts.service.transaction.returnOrder.exportTasks(status)({
            task: taskRepo,
            transaction: transactionRepo
        });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('service.transaction.returnOrder.exportTasksById()', () => {
    beforeEach(() => {
        // no op
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('取引ステータスがタスク出力可能なものでなければNotImplementedエラーとなるはず', async () => {
        const returnOrderTransaction = {
            agent: {},
            id: 'transactionId',
            status: 'invalidStatus'
        };

        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(returnOrderTransaction);
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.transaction.returnOrder.exportTasksById(returnOrderTransaction.id)({
            task: taskRepo,
            transaction: transactionRepo
        })
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotImplemented);
        sandbox.verify();
    });
});

describe('service.transaction.returnOrder.createRefundEmail()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('メール本文のレンダリングに失敗すればそのままエラーとなるはず', async () => {
        const order = {
            orderNumber: 'orderNumber',
            orderStatus: sskts.factory.orderStatus.OrderDelivered,
            seller: {},
            customer: {}
        };
        const placeOrderTransaction = {
            id: 'transactionId',
            result: {
                order: order
            }
        };
        const customerContact = {};
        const sellerOrganization = {};
        const renderError = new Error('renderError');

        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(pug).expects('renderFile').once().callsArgWith(2, renderError);

        const result = await sskts.service.transaction.returnOrder.createRefundEmail({
            transaction: <any>placeOrderTransaction,
            customerContact: <any>customerContact,
            order: <any>order,
            seller: <any>sellerOrganization
        }).catch((err) => err);

        assert.deepEqual(result, renderError);
        sandbox.verify();
    });

    it('メール件名のレンダリングに失敗すればそのままエラーとなるはず', async () => {
        const order = {
            orderNumber: 'orderNumber',
            orderStatus: sskts.factory.orderStatus.OrderDelivered,
            seller: {},
            customer: {}
        };
        const placeOrderTransaction = {
            id: 'transactionId',
            result: {
                order: order
            }
        };
        const customerContact = {};
        const sellerOrganization = {};
        const message = 'body';
        const renderError = new Error('renderError');

        sandbox.mock(pug).expects('renderFile').twice()
            // tslint:disable-next-line:no-magic-numbers
            .onFirstCall().callsArgWith(2, null, message)
            // tslint:disable-next-line:no-magic-numbers
            .onSecondCall().callsArgWith(2, renderError);

        const result = await sskts.service.transaction.returnOrder.createRefundEmail({
            transaction: <any>placeOrderTransaction,
            customerContact: <any>customerContact,
            order: <any>order,
            seller: <any>sellerOrganization
        }).catch((err) => err);

        assert.deepEqual(result, renderError);
        sandbox.verify();
    });
});
