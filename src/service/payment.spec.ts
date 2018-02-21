// tslint:disable:no-implicit-dependencies
/**
 * sales service test
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;
let existingTransaction: any;

before(() => {
    sandbox = sinon.sandbox.create();
    existingTransaction = {
        id: '123',
        object: {
            authorizeActions: [
                {
                    id: 'actionId',
                    actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                    purpose: {},
                    object: {
                        typeOf: sskts.factory.action.authorize.authorizeActionPurpose.CreditCard,
                        amount: 123,
                        orderId: 'orderId'
                    },
                    result: {
                        price: 123,
                        entryTranArgs: {},
                        execTranArgs: {}
                    }
                }
            ]
        },
        result: {
            order: { orderNumber: 'orderNumber' }
        },
        potentialActions: {
            order: {
                typeOf: 'actionType',
                potentialActions: {
                    payCreditCard: { typeOf: 'actionType' },
                    useMvtk: { typeOf: 'actionType' }
                }
            }
        }
    };
});

describe('cancelCreditCardAuth()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryとGMOの状態が正常であれば、エラーにならないはず', async () => {
        const authorizeActions = [
            {
                id: 'actionId',
                actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                object: { typeOf: sskts.factory.action.authorize.authorizeActionPurpose.CreditCard },
                purpose: {},
                result: {
                    entryTranArgs: {},
                    execTranArgs: {}
                }
            }
        ];
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);

        sandbox.mock(actionRepo).expects('findAuthorizeByTransactionId').once()
            .withExactArgs(existingTransaction.id).resolves(authorizeActions);
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').once().resolves();

        const result = await sskts.service.payment.cancelCreditCardAuth(existingTransaction.id)(actionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('settleCreditCardAuth()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('仮売上状態であれば、実売上に成功するはず', async () => {
        const searchTradeResult = { jobCd: sskts.GMO.utils.util.JobCd.Auth };
        const action = { id: 'actionId' };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(actionRepo).expects('start').once()
            .withExactArgs(existingTransaction.potentialActions.order.potentialActions.payCreditCard).resolves(action);
        sandbox.mock(actionRepo).expects('complete').once()
            .withArgs(existingTransaction.potentialActions.order.potentialActions.payCreditCard.typeOf, action.id).resolves(action);
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(existingTransaction.id).resolves(existingTransaction);
        sandbox.mock(sskts.GMO.services.credit).expects('searchTrade').once().resolves(searchTradeResult);
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').once().resolves();

        const result = await sskts.service.payment.payCreditCard(existingTransaction.id)(actionRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('注文取引結果が未定義であればNotFoundエラーとなるはず', async () => {
        const transaction = { ...existingTransaction, result: undefined };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(existingTransaction.id).resolves(transaction);
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.payment.payCreditCard(transaction.id)(
            actionRepo, transactionRepo
        ).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('注文取引の潜在アクションが未定義であればNotFoundエラーとなるはず', async () => {
        const transaction = { ...existingTransaction, potentialActions: undefined };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(existingTransaction.id).resolves(transaction);
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.payment.payCreditCard(transaction.id)(
            actionRepo, transactionRepo
        ).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('すでに実売上済であれば、実売上リクエストは実行されないはず', async () => {
        const searchTradeResult = { jobCd: sskts.GMO.utils.util.JobCd.Sales };
        const action = { id: 'actionId' };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(actionRepo).expects('start').once()
            .withExactArgs(existingTransaction.potentialActions.order.potentialActions.payCreditCard).resolves(action);
        sandbox.mock(actionRepo).expects('complete').once()
            .withArgs(existingTransaction.potentialActions.order.potentialActions.payCreditCard.typeOf, action.id).resolves(action);
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(existingTransaction.id).resolves(existingTransaction);
        sandbox.mock(sskts.GMO.services.credit).expects('searchTrade').once().resolves(searchTradeResult);
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').never();

        const result = await sskts.service.payment.payCreditCard(existingTransaction.id)(actionRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('GMO実売上に失敗すればアクションにエラー結果が追加されるはず', async () => {
        const searchTradeResult = { jobCd: sskts.GMO.utils.util.JobCd.Auth };
        const action = { id: 'actionId' };
        const alterTranResult = new Error('alterTranError');

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(actionRepo).expects('start').once()
            .withExactArgs(existingTransaction.potentialActions.order.potentialActions.payCreditCard).resolves(action);
        sandbox.mock(actionRepo).expects('giveUp')
            .withArgs(existingTransaction.potentialActions.order.potentialActions.payCreditCard.typeOf, action.id).resolves(action);
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(existingTransaction.id).resolves(existingTransaction);
        sandbox.mock(sskts.GMO.services.credit).expects('searchTrade').once().resolves(searchTradeResult);
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').once().rejects(alterTranResult);

        const result = await sskts.service.payment.payCreditCard(existingTransaction.id)(
            actionRepo, transactionRepo
        ).catch((err) => err);

        assert.deepEqual(result, alterTranResult);
        sandbox.verify();
    });

    it('注文アクションの潜在アクションにクレジットカード決済アクションがなければ何もしない', async () => {
        const placeOrderTransaction = { ...existingTransaction };
        placeOrderTransaction.potentialActions.order.potentialActions.payCreditCard = undefined;

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(placeOrderTransaction.id).resolves(placeOrderTransaction);
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.payment.payCreditCard(placeOrderTransaction.id)(actionRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

});

describe('cancelMvtk()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('何もしないので、エラーにならないはず', async () => {
        const result = await sskts.service.payment.cancelMvtk(existingTransaction.id)();

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('settleMvtk()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('何もしないので、エラーにならないはず', async () => {
        const action = { id: 'actionId' };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(actionRepo).expects('start').once()
            .withExactArgs(existingTransaction.potentialActions.order.potentialActions.useMvtk).resolves(action);
        sandbox.mock(actionRepo).expects('complete').once()
            .withArgs(existingTransaction.potentialActions.order.potentialActions.useMvtk.typeOf, action.id).resolves(action);
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(existingTransaction.id).resolves(existingTransaction);

        const result = await sskts.service.payment.useMvtk(existingTransaction.id)(actionRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('注文取引結果が未定義であればNotFoundエラーとなるはず', async () => {
        const placeOrderTransaction = { ...existingTransaction, result: undefined };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(placeOrderTransaction.id).resolves(placeOrderTransaction);
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.payment.useMvtk(existingTransaction.id)(actionRepo, transactionRepo)
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('注文取引の潜在アクションが未定義であればNotFoundエラーとなるはず', async () => {
        const placeOrderTransaction = { ...existingTransaction, potentialActions: undefined };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(placeOrderTransaction.id).resolves(placeOrderTransaction);
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.payment.useMvtk(existingTransaction.id)(actionRepo, transactionRepo)
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('ムビチケ使用アクションがなければ何もしないはず', async () => {
        const placeOrderTransaction = { ...existingTransaction };
        placeOrderTransaction.potentialActions.order.potentialActions.useMvtk = undefined;

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(placeOrderTransaction.id).resolves(placeOrderTransaction);
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.payment.useMvtk(existingTransaction.id)(actionRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('refundCreditCard()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('実売上状態であれば売上取消するはず', async () => {
        const placeOrderTransaction = { ...existingTransaction };
        const refundActionAttributes = {
            typeOf: sskts.factory.actionType.RefundAction,
            potentialActions: {
                sendEmailMessage: {
                    typeOf: sskts.factory.actionType.SendAction
                }
            }
        };
        const returnOrderTransaction = {
            id: 'returnOrderTransactionId',
            typeOf: sskts.factory.transactionType.ReturnOrder,
            object: { transaction: placeOrderTransaction },
            potentialActions: {
                returnOrder: {
                    potentialActions: {
                        refund: refundActionAttributes
                    }
                }
            }
        };
        const action = { typeOf: refundActionAttributes.typeOf, id: 'actionId' };
        const searchTradeResult = { status: sskts.GMO.utils.util.Status.Sales };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findReturnOrderById').once()
            .withExactArgs(returnOrderTransaction.id).resolves(returnOrderTransaction);
        sandbox.mock(actionRepo).expects('start').once()
            .withExactArgs(refundActionAttributes).resolves(action);
        sandbox.mock(actionRepo).expects('complete').once()
            .withArgs(action.typeOf, action.id).resolves(action);
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(sskts.GMO.services.credit).expects('searchTrade').once().resolves(searchTradeResult);
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').once().resolves();
        sandbox.mock(taskRepo).expects('save').once();

        const result = await sskts.service.payment.refundCreditCard(returnOrderTransaction.id)(
            actionRepo, transactionRepo, taskRepo
        );

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('返品取引の潜在アクションが未定義であればNotFoundエラーとなるはず', async () => {
        const placeOrderTransaction = { ...existingTransaction };
        const returnOrderTransaction = {
            id: 'returnOrderTransactionId',
            typeOf: sskts.factory.transactionType.ReturnOrder,
            object: { transaction: placeOrderTransaction }
            // potentialActions: {
            //     returnOrder: {
            //         potentialActions: {
            //             refund: refundActionAttributes
            //         }
            //     }
            // }
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findReturnOrderById').once()
            .withExactArgs(returnOrderTransaction.id).resolves(returnOrderTransaction);
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.payment.refundCreditCard(returnOrderTransaction.id)(
            actionRepo, transactionRepo, taskRepo
        ).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('注文取引結果が未定義であればNotFoundエラーとなるはず', async () => {
        const placeOrderTransaction = { ...existingTransaction, result: undefined };
        const refundActionAttributes = {
            typeOf: sskts.factory.actionType.RefundAction,
            potentialActions: {
                sendEmailMessage: {
                    typeOf: sskts.factory.actionType.SendAction
                }
            }
        };
        const returnOrderTransaction = {
            id: 'returnOrderTransactionId',
            typeOf: sskts.factory.transactionType.ReturnOrder,
            object: { transaction: placeOrderTransaction },
            potentialActions: {
                returnOrder: {
                    potentialActions: {
                        refund: refundActionAttributes
                    }
                }
            }
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findReturnOrderById').once()
            .withExactArgs(returnOrderTransaction.id).resolves(returnOrderTransaction);
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.payment.refundCreditCard(returnOrderTransaction.id)(
            actionRepo, transactionRepo, taskRepo
        ).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('売上取消状態であれば状態変更しないはず', async () => {
        const placeOrderTransaction = { ...existingTransaction };
        const refundActionAttributes = {
            typeOf: sskts.factory.actionType.RefundAction,
            potentialActions: {
                sendEmailMessage: {
                    typeOf: sskts.factory.actionType.SendAction
                }
            }
        };
        const returnOrderTransaction = {
            id: 'returnOrderTransactionId',
            typeOf: sskts.factory.transactionType.ReturnOrder,
            object: { transaction: placeOrderTransaction },
            potentialActions: {
                returnOrder: {
                    potentialActions: {
                        refund: refundActionAttributes
                    }
                }
            }
        };
        const action = { typeOf: refundActionAttributes.typeOf, id: 'actionId' };
        const searchTradeResult = { status: sskts.GMO.utils.util.Status.Void };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findReturnOrderById').once()
            .withExactArgs(returnOrderTransaction.id).resolves(returnOrderTransaction);
        sandbox.mock(actionRepo).expects('start').once()
            .withExactArgs(refundActionAttributes).resolves(action);
        sandbox.mock(actionRepo).expects('complete').once()
            .withArgs(action.typeOf, action.id).resolves(action);
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(sskts.GMO.services.credit).expects('searchTrade').once().resolves(searchTradeResult);
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').never();
        sandbox.mock(taskRepo).expects('save').once();

        const result = await sskts.service.payment.refundCreditCard(returnOrderTransaction.id)(
            actionRepo, transactionRepo, taskRepo
        );

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('クレジットカード取引状態変更に失敗すればアクションにエラー結果が追加されるはず', async () => {
        const placeOrderTransaction = { ...existingTransaction };
        const refundActionAttributes = {
            typeOf: sskts.factory.actionType.RefundAction,
            potentialActions: {
                sendEmailMessage: {
                    typeOf: sskts.factory.actionType.SendAction
                }
            }
        };
        const returnOrderTransaction = {
            id: 'returnOrderTransactionId',
            typeOf: sskts.factory.transactionType.ReturnOrder,
            object: { transaction: placeOrderTransaction },
            potentialActions: {
                returnOrder: {
                    potentialActions: {
                        refund: refundActionAttributes
                    }
                }
            }
        };
        const action = { typeOf: refundActionAttributes.typeOf, id: 'actionId' };
        const searchTradeResult = { status: sskts.GMO.utils.util.Status.Sales };
        const alterTranResult = new Error('alterTranError');

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findReturnOrderById').once()
            .withExactArgs(returnOrderTransaction.id).resolves(returnOrderTransaction);
        sandbox.mock(actionRepo).expects('start').once()
            .withExactArgs(refundActionAttributes).resolves(action);
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(actionRepo).expects('giveUp').once()
            .withArgs(action.typeOf, action.id).resolves(action);
        sandbox.mock(sskts.GMO.services.credit).expects('searchTrade').once().resolves(searchTradeResult);
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').once().rejects(alterTranResult);
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.payment.refundCreditCard(returnOrderTransaction.id)(
            actionRepo, transactionRepo, taskRepo
        ).catch((err) => err);

        assert.deepEqual(result, alterTranResult);
        sandbox.verify();
    });
});
