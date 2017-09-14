/**
 * placeOrder transaction service test
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('exportTasks()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    // it('タスクエクスポート待ちの取引があれば、エクスポートされるはず', async () => {
    //     const status = sskts.factory.transactionStatusType.Confirmed;
    //     const transaction = {
    //         id: sskts.mongoose.Types.ObjectId(),
    //         status: status
    //     };
    //     const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
    //     const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

    //     sandbox.mock(transactionRepo.transactionModel).expects('findOneAndUpdate').once()
    //         .withArgs({
    //             status: status,
    //             tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported
    //         }).returns({
    //             exec: async () => {
    //                 return { toObject: () => transaction };
    //             }
    //         });
    //     sandbox.mock(sskts.service.transaction.placeOrder).expects('exportTasksById').once()
    //         .withArgs(transaction.id).returns(async () => []);
    //     sandbox.mock(transactionRepo).expects('setTasksExportedById').once()
    //         .withArgs(transaction.id).returns(Promise.resolve());

    //     const result = await sskts.service.transaction.placeOrder.exportTasks(
    //         status
    //     )(taskRepo, transactionRepo);

    //     assert.equal(result, undefined);
    //     sandbox.verify();
    // });

    it('タスクエクスポート待ちの取引がなければ、何もしないはず', async () => {
        const status = sskts.factory.transactionStatusType.Confirmed;
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo.transactionModel).expects('findOneAndUpdate').once()
            .withArgs({
                status: status,
                tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported
            }).returns({
                exec: async () => {
                    return null;
                }
            });
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

    it('確定取引であれば5つのタスクがエクスポートされるはず', async () => {
        const numberOfTasks = 5;
        const transaction = {
            id: 'transactionId',
            status: sskts.factory.transactionStatusType.Confirmed
        };
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(taskRepo).expects('save').exactly(numberOfTasks).returns(Promise.resolve());

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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(taskRepo).expects('save').exactly(numberOfTasks).returns(Promise.resolve());

        const result = await sskts.service.transaction.placeOrder.exportTasksById(
            transaction.id
        )(taskRepo, transactionRepo);

        assert(Array.isArray(result));
        assert.equal(result.length, numberOfTasks);
        sandbox.verify();
    });
});
