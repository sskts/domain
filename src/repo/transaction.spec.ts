/**
 * transaction repository test
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports
// tslint:disable-next-line:no-var-requires
require('sinon-mongoose');
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('startPlaceOrder()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、開始できるはず', async () => {
        const transaction = { id: 'id' };

        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('create').once()
            .resolves();

        const result = await repository.startPlaceOrder(<any>transaction);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('findPlaceOrderById()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('取引が存在すれば、オブジェクトが返却されるはず', async () => {
        const transactionId = 'transactionId';

        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('findOne').once()
            .chain('exec')
            .resolves(new repository.transactionModel());

        const result = await repository.findPlaceOrderById(transactionId);

        assert.equal(typeof result, 'object');
        sandbox.verify();
    });
});

describe('findPlaceOrderInProgressById()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('取引が存在すれば、オブジェクトが返却されるはず', async () => {
        const transactionId = 'transactionId';

        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('findOne').once()
            .chain('exec')
            .resolves(new repository.transactionModel());

        const result = await repository.findPlaceOrderInProgressById(transactionId);

        assert.equal(typeof result, 'object');
        sandbox.verify();
    });
});

describe('setCustomerContactsOnPlaceOrderInProgress()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('取引が存在すれば、エラーにならないはず', async () => {
        const transactionId = 'transactionId';
        const contact = {};

        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('findOneAndUpdate').once()
            .chain('exec')
            .resolves(new repository.transactionModel());

        const result = await repository.setCustomerContactsOnPlaceOrderInProgress(transactionId, <any>contact);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('confirmPlaceOrder()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('取引が存在すれば、エラーにならないはず', async () => {
        const transactionId = 'transactionId';
        const transactionResult = {};

        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('findOneAndUpdate').once()
            .chain('exec')
            .resolves(new repository.transactionModel());

        const result = await repository.confirmPlaceOrder(transactionId, <any>transactionResult);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('reexportTasks()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('MongoDBの状態が正常であれば、エラーにならないはず', async () => {
        const intervalInMinutes = 10;

        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('findOneAndUpdate').once()
            .chain('exec')
            .resolves(new repository.transactionModel());

        const result = await repository.reexportTasks(intervalInMinutes);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('setTasksExportedById()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('MongoDBの状態が正常であれば、エラーにならないはず', async () => {
        const transactionId = 'transactionId';
        const tasks: any[] = [];

        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('findByIdAndUpdate').once().withArgs(transactionId)
            .chain('exec')
            .resolves(new repository.transactionModel());

        const result = await repository.setTasksExportedById(transactionId, tasks);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('makeExpired()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('MongoDBの状態が正常であれば、エラーにならないはず', async () => {
        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('update').once()
            .chain('exec')
            .resolves();

        const result = await repository.makeExpired();

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('pushPaymentInfo()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('MongoDBの状態が正常であれば、エラーにならないはず', async () => {
        const transactionId = 'transactionId';
        const authorizeAction = {};

        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('findByIdAndUpdate').once().withArgs(transactionId)
            .chain('exec')
            .resolves(new repository.transactionModel());

        const result = await repository.pushPaymentInfo(transactionId, <any>authorizeAction);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('pullPaymentInfo()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('MongoDBの状態が正常であれば、エラーにならないはず', async () => {
        const transactionId = 'transactionId';
        const actionId = 'actionId';

        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('findByIdAndUpdate').once().withArgs(transactionId)
            .chain('exec')
            .resolves(new repository.transactionModel());

        const result = await repository.pullPaymentInfo(transactionId, actionId);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('addSeatReservation()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('MongoDBの状態が正常であれば、エラーにならないはず', async () => {
        const transactionId = 'transactionId';
        const authorizeAction = {};

        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('findByIdAndUpdate').once().withArgs(transactionId)
            .chain('exec')
            .resolves(new repository.transactionModel());

        const result = await repository.addSeatReservation(transactionId, <any>authorizeAction);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('removeSeatReservation()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('MongoDBの状態が正常であれば、エラーにならないはず', async () => {
        const transactionId = 'transactionId';

        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('findByIdAndUpdate').once().withArgs(transactionId)
            .chain('exec')
            .resolves(new repository.transactionModel());

        const result = await repository.removeSeatReservation(transactionId);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('pushDiscountInfo()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('MongoDBの状態が正常であれば、エラーにならないはず', async () => {
        const transactionId = 'transactionId';
        const authorizeAction = {};

        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('findByIdAndUpdate').once().withArgs(transactionId)
            .chain('exec')
            .resolves(new repository.transactionModel());

        const result = await repository.pushDiscountInfo(transactionId, <any>authorizeAction);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('pullDiscountInfo()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('MongoDBの状態が正常であれば、エラーにならないはず', async () => {
        const transactionId = 'transactionId';
        const actionId = 'actionId';

        const repository = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(repository.transactionModel)
            .expects('findByIdAndUpdate').once().withArgs(transactionId)
            .chain('exec')
            .resolves(new repository.transactionModel());

        const result = await repository.pullDiscountInfo(transactionId, actionId);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
