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
                order: {}
            }
        };
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(orderRepo).expects('save').once()
            .withExactArgs(transaction.result.order).returns(Promise.resolve());

        const result = await sskts.service.order.createFromTransaction(transaction.id)(orderRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
