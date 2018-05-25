// tslint:disable:no-implicit-dependencies
/**
 * discount service test
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
        agent: { typeOf: 'Person' },
        seller: { typeOf: sskts.factory.organizationType.MovieTheater },
        object: {
            customerContact: {},
            authorizeActions: [
                {
                    id: 'actionId',
                    actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                    purpose: {},
                    object: {
                        typeOf: sskts.factory.action.authorize.paymentMethod.creditCard.ObjectType.CreditCard,
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
                typeOf: sskts.factory.actionType.OrderAction,
                potentialActions: {
                    payCreditCard: { typeOf: sskts.factory.actionType.PayAction },
                    payPecorino: { typeOf: sskts.factory.actionType.PayAction },
                    useMvtk: { typeOf: sskts.factory.actionType.UseAction }
                }
            }
        }
    };
});

describe('cancelMvtk()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('何もしないので、エラーにならないはず', async () => {
        const result = await sskts.service.discount.mvtk.cancelMvtk(existingTransaction.id)();

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('useMvtk()', () => {
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
        sandbox.mock(transactionRepo).expects('findById').once().resolves(existingTransaction);

        const result = await sskts.service.discount.mvtk.useMvtk(existingTransaction.id)({
            action: actionRepo,
            transaction: transactionRepo
        });

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('注文取引結果が未定義であればNotFoundエラーとなるはず', async () => {
        const placeOrderTransaction = { ...existingTransaction, result: undefined };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(placeOrderTransaction);
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.discount.mvtk.useMvtk(existingTransaction.id)({
            action: actionRepo,
            transaction: transactionRepo
        })
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('注文取引の潜在アクションが未定義であればNotFoundエラーとなるはず', async () => {
        const placeOrderTransaction = { ...existingTransaction, potentialActions: undefined };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(placeOrderTransaction);
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.discount.mvtk.useMvtk(existingTransaction.id)({
            action: actionRepo,
            transaction: transactionRepo
        })
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('注文アクションの潜在アクションが未定義であればNotFoundエラーとなるはず', async () => {
        const transaction = {
            ...existingTransaction,
            potentialActions: {
                order: {}
            }
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(transaction);
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.discount.mvtk.useMvtk(existingTransaction.id)({
            action: actionRepo,
            transaction: transactionRepo
        })
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('ムビチケ使用アクションがなければ何もしないはず', async () => {
        const placeOrderTransaction = { ...existingTransaction };
        placeOrderTransaction.potentialActions.order.potentialActions.useMvtk = undefined;

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(placeOrderTransaction);
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.discount.mvtk.useMvtk(existingTransaction.id)({
            action: actionRepo,
            transaction: transactionRepo
        });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
