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
                    actionStatus: 'CompletedActionStatus',
                    purpose: {
                        typeOf: sskts.factory.action.authorize.authorizeActionPurpose.CreditCard
                    },
                    result: {
                        price: 123,
                        entryTranArgs: {},
                        execTranArgs: {}
                    }
                }
            ]
        }
    };
});

describe('cancelCreditCardAuth()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryとGMOの状態が正常であれば、エラーにならないはず', async () => {
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withArgs(existingTransaction.id).returns(Promise.resolve(existingTransaction));
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').once().returns(Promise.resolve());
        const result = await sskts.service.sales.cancelCreditCardAuth(existingTransaction.id)(transactionRepo);

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
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withArgs(existingTransaction.id).returns(Promise.resolve(existingTransaction));
        sandbox.mock(sskts.GMO.services.credit).expects('searchTrade').once()
            .returns(Promise.resolve(searchTradeResult));
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').once()
            .returns(Promise.resolve());

        const result = await sskts.service.sales.settleCreditCardAuth(existingTransaction.id)(transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('すでに実売上済であれば、実売上リクエストは実行されないはず', async () => {
        const searchTradeResult = { jobCd: sskts.GMO.utils.util.JobCd.Sales };
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withArgs(existingTransaction.id).returns(Promise.resolve(existingTransaction));
        sandbox.mock(sskts.GMO.services.credit).expects('searchTrade').once()
            .returns(Promise.resolve(searchTradeResult));
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').never();

        const result = await sskts.service.sales.settleCreditCardAuth(existingTransaction.id)(transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('cancelMvtk()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('何もしないので、エラーにならないはず', async () => {
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        const result = await sskts.service.sales.cancelMvtk(existingTransaction.id)(transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('settleMvtk()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('何もしないので、エラーにならないはず', async () => {
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        const result = await sskts.service.sales.settleMvtk(existingTransaction.id)(transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
