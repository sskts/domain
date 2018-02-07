// tslint:disable:no-implicit-dependencies
/**
 * order service test
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('createFromTransaction()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、エラーにならないはず', async () => {
        const transaction = {
            id: 'id',
            result: {
                order: {},
                postActions: { orderAction: { typeOf: 'actionType' } }
            }
        };
        const action = { id: 'actionId' };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(actionRepo).expects('start').once()
            .withExactArgs(transaction.result.postActions.orderAction).resolves(action);
        sandbox.mock(actionRepo).expects('complete').once()
            .withArgs(transaction.result.postActions.orderAction.typeOf, action.id).resolves(action);
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(orderRepo).expects('save').once()
            .withExactArgs(transaction.result.order).resolves();

        const result = await sskts.service.order.createFromTransaction(transaction.id)(actionRepo, orderRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
