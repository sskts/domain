// tslint:disable:no-implicit-dependencies
/**
 * 注文サービステスト
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('createFromTransaction()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('注文取引から注文を作成できるはず', async () => {
        const transaction = {
            id: 'id',
            result: {
                order: {}
            },
            potentialActions: {
                order: {
                    typeOf: 'actionType',
                    potentialActions: {
                        sendOrder: { typeOf: sskts.factory.actionType.SendAction },
                        payCreditCard: { typeOf: sskts.factory.actionType.PayAction },
                        payPecorino: { typeOf: sskts.factory.actionType.PayAction },
                        useMvtk: { typeOf: sskts.factory.actionType.UseAction }
                    }
                }
            }
        };
        const action = { id: 'actionId' };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(actionRepo).expects('start').once()
            .withExactArgs(transaction.potentialActions.order).resolves(action);
        sandbox.mock(actionRepo).expects('complete').once()
            .withArgs(transaction.potentialActions.order.typeOf, action.id).resolves(action);
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(orderRepo).expects('createIfNotExist').once()
            .withExactArgs(transaction.result.order).resolves();
        sandbox.mock(taskRepo).expects('save').exactly(Object.keys(transaction.potentialActions.order.potentialActions).length);

        const result = await sskts.service.order.createFromTransaction(transaction.id)({
            action: actionRepo,
            order: orderRepo,
            transaction: transactionRepo,
            task: taskRepo
        });

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('注文取引結果が存在しなければNotFoundエラーとなるはず', async () => {
        const transaction = {
            id: 'id'
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(actionRepo).expects('start').never();
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(orderRepo).expects('createIfNotExist').never();
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.order.createFromTransaction(transaction.id)({
            action: actionRepo,
            order: orderRepo,
            transaction: transactionRepo,
            task: taskRepo
        })
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('注文取引潜在アクションが存在しなければNotFoundエラーとなるはず', async () => {
        const transaction = {
            id: 'id',
            result: {}
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(actionRepo).expects('start').never();
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(orderRepo).expects('createIfNotExist').never();
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.order.createFromTransaction(transaction.id)({
            action: actionRepo,
            order: orderRepo,
            transaction: transactionRepo,
            task: taskRepo
        })
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('注文作成に失敗すればアクションにエラー結果が追加されるはず', async () => {
        const transaction = {
            id: 'id',
            result: {
                order: {}
            },
            potentialActions: {
                order: {
                    typeOf: 'actionType',
                    potentialActions: {
                        payCreditCard: { typeOf: 'actionType' }
                    }
                }
            }
        };
        const action = { id: 'actionId', typeOf: transaction.potentialActions.order.typeOf };
        const createOrderError = new Error('createOrderError');

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(actionRepo).expects('start').once().resolves(action);
        sandbox.mock(actionRepo).expects('giveUp').once().withArgs(action.typeOf, action.id).resolves(action);
        sandbox.mock(orderRepo).expects('createIfNotExist').once().rejects(createOrderError);
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.order.createFromTransaction(transaction.id)({
            action: actionRepo,
            order: orderRepo,
            transaction: transactionRepo,
            task: taskRepo
        }).catch((err) => err);

        assert.deepEqual(result, createOrderError);
        sandbox.verify();
    });
});

describe('cancelReservations()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('アクションを完了できるはず', async () => {
        const order = {
            orderNumber: 'orderNumber',
            orderInquiryKey: {
                telephone: '+819012345678'
            }
        };
        const ownershipInfos = [
            { identifier: 'identifier' }
        ];
        const placeOrderTransaction = {
            result: {
                order: order,
                ownershipInfos: ownershipInfos
            }
        };
        const returnOrderTransaction = {
            id: 'id',
            object: {
                transaction: placeOrderTransaction
            },
            result: {},
            potentialActions: {
                returnOrder: {
                    typeOf: sskts.factory.actionType.ReturnAction,
                    object: order,
                    potentialActions: {
                        refundCreditCard: {}
                    }
                }
            }
        };
        const action = { id: 'actionId', typeOf: returnOrderTransaction.potentialActions.returnOrder.typeOf };
        const stateReserveResult = {};

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findReturnOrderById').once()
            .withExactArgs(returnOrderTransaction.id).resolves(returnOrderTransaction);
        sandbox.mock(actionRepo).expects('start').once()
            .withExactArgs(returnOrderTransaction.potentialActions.returnOrder).resolves(action);
        sandbox.mock(actionRepo).expects('complete').once()
            .withArgs(action.typeOf, action.id).resolves(action);
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').once().resolves(stateReserveResult);
        sandbox.mock(sskts.COA.services.reserve).expects('delReserve').once().resolves();
        sandbox.mock(ownershipInfoRepo.ownershipInfoModel).expects('findOneAndUpdate')
            .exactly(ownershipInfos.length).chain('exec');
        sandbox.mock(orderRepo).expects('changeStatus').once().withArgs(order.orderNumber);
        sandbox.mock(taskRepo).expects('save').once();

        const result = await sskts.service.order.cancelReservations(returnOrderTransaction.id)(
            actionRepo, orderRepo, ownershipInfoRepo, transactionRepo, taskRepo
        );

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('潜在アクションが定義されていなければNotFoundエラー', async () => {
        const placeOrderTransaction = {};
        const returnOrderTransaction = {
            id: 'id',
            object: { transaction: placeOrderTransaction },
            result: {}
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findReturnOrderById').once()
            .withExactArgs(returnOrderTransaction.id).resolves(returnOrderTransaction);
        sandbox.mock(actionRepo).expects('start').never();
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').never();
        sandbox.mock(sskts.COA.services.reserve).expects('delReserve').never();
        sandbox.mock(ownershipInfoRepo.ownershipInfoModel).expects('findOneAndUpdate').never();
        sandbox.mock(orderRepo).expects('changeStatus').never();
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.order.cancelReservations(returnOrderTransaction.id)(
            actionRepo, orderRepo, ownershipInfoRepo, transactionRepo, taskRepo
        ).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('注文取引結果が定義されていなければNotFoundエラー', async () => {
        const placeOrderTransaction = {};
        const returnOrderTransaction = {
            id: 'id',
            object: { transaction: placeOrderTransaction },
            potentialActions: {},
            result: {}
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findReturnOrderById').once()
            .withExactArgs(returnOrderTransaction.id).resolves(returnOrderTransaction);
        sandbox.mock(actionRepo).expects('start').never();
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').never();
        sandbox.mock(sskts.COA.services.reserve).expects('delReserve').never();
        sandbox.mock(ownershipInfoRepo.ownershipInfoModel).expects('findOneAndUpdate').never();
        sandbox.mock(orderRepo).expects('changeStatus').never();
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.order.cancelReservations(returnOrderTransaction.id)(
            actionRepo, orderRepo, ownershipInfoRepo, transactionRepo, taskRepo
        ).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('COA予約内容抽出に失敗すればアクションにエラー結果が追加されるはず', async () => {
        const order = {
            orderNumber: 'orderNumber',
            orderInquiryKey: {
                telephone: '+819012345678'
            }
        };
        const ownershipInfos = [
            { identifier: 'identifier' }
        ];
        const placeOrderTransaction = {
            result: {
                order: order,
                ownershipInfos: ownershipInfos
            }
        };
        const returnOrderTransaction = {
            id: 'id',
            object: {
                transaction: placeOrderTransaction
            },
            result: {},
            potentialActions: {
                returnOrder: {
                    typeOf: sskts.factory.actionType.ReturnAction,
                    object: order,
                    potentialActions: {
                        refund: {}
                    }
                }
            }
        };
        const action = { id: 'actionId', typeOf: returnOrderTransaction.potentialActions.returnOrder.typeOf };
        const stateReserveResult = new Error('stateReserveError');

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findReturnOrderById').once()
            .withExactArgs(returnOrderTransaction.id).resolves(returnOrderTransaction);
        sandbox.mock(actionRepo).expects('start').once()
            .withExactArgs(returnOrderTransaction.potentialActions.returnOrder).resolves(action);
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(actionRepo).expects('giveUp').once().withArgs(action.typeOf, action.id).resolves(action);
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').once().rejects(stateReserveResult);
        sandbox.mock(sskts.COA.services.reserve).expects('delReserve').never();
        sandbox.mock(ownershipInfoRepo.ownershipInfoModel).expects('findOneAndUpdate').never();
        sandbox.mock(orderRepo).expects('changeStatus').once().never();
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.order.cancelReservations(returnOrderTransaction.id)(
            actionRepo, orderRepo, ownershipInfoRepo, transactionRepo, taskRepo
        ).catch((err) => err);

        assert.deepEqual(result, stateReserveResult);
        sandbox.verify();
    });
});
