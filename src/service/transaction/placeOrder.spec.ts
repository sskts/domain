// tslint:disable:no-implicit-dependencies
/**
 * placeOrder transaction service test
 */
import * as mongoose from 'mongoose';
import * as assert from 'power-assert';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');
import * as sskts from '../../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.createSandbox();
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
            agent: {},
            result: { order: {} }
        };
        const emailMessageAttributes = {
            sender: { name: 'name', email: 'test@example.com' },
            toRecipient: { name: 'name', email: 'test@example.com' },
            about: 'about',
            text: 'text'
        };
        const task = {};

        const transactionRepo = new sskts.repository.Transaction(mongoose.connection);
        const taskRepo = new sskts.repository.Task(mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(transaction);
        sandbox.mock(taskRepo).expects('save').once().resolves(task);

        const result = await sskts.service.transaction.placeOrder.sendEmail(
            transaction.id,
            <any>emailMessageAttributes
        )({
            task: taskRepo,
            transaction: transactionRepo
        });

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

        const transactionRepo = new sskts.repository.Transaction(mongoose.connection);
        const taskRepo = new sskts.repository.Task(mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(transaction);
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.transaction.placeOrder.sendEmail(
            transaction.id,
            <any>emailMessageAttributes
        )({
            task: taskRepo,
            transaction: transactionRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});
