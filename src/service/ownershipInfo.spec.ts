// tslint:disable:no-implicit-dependencies
/**
 * 所有権サービステスト
 * @ignore
 */

import * as mongoose from 'mongoose';
import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';

import { MongoRepository as ActionRepo } from '../repo/action';
import { MongoRepository as OwnershipInfoRepo } from '../repo/ownershipInfo';
import { MongoRepository as TransactionRepo } from '../repo/transaction';
import * as OwnershipInfoService from './ownershipInfo';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('OwnershipInfoService.createFromTransaction()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('取引結果があれば、注文を作成できるはず', async () => {
        const transaction = {
            id: 'transactionId',
            result: {
                ownershipInfos: [{ identifier: 'identifier' }, { identifier: 'identifier' }, { identifier: 'identifier' }]
            },
            potentialActions: { order: { potentialActions: { sendOrder: { typeOf: 'actionType' } } } }
        };
        const action = { id: 'actionId' };

        const actionRepo = new ActionRepo(mongoose.connection);
        const ownershipInfoRepo = new OwnershipInfoRepo(mongoose.connection);
        const transactionRepo = new TransactionRepo(mongoose.connection);

        sandbox.mock(actionRepo).expects('start').once()
            .withExactArgs(transaction.potentialActions.order.potentialActions.sendOrder).resolves(action);
        sandbox.mock(actionRepo).expects('complete').once()
            .withArgs(transaction.potentialActions.order.potentialActions.sendOrder.typeOf, action.id).resolves(action);
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once().resolves(transaction);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(ownershipInfoRepo).expects('save').exactly(transaction.result.ownershipInfos.length).resolves();

        const result = await OwnershipInfoService.createFromTransaction(transaction.id)(actionRepo, ownershipInfoRepo, transactionRepo);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('取引結果がなければ、エラー', async () => {
        const transaction = {
            id: 'transactionId'
        };

        const actionRepo = new ActionRepo(mongoose.connection);
        const ownershipInfoRepo = new OwnershipInfoRepo(mongoose.connection);
        const transactionRepo = new TransactionRepo(mongoose.connection);

        sandbox.mock(actionRepo).expects('start').never();
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once().resolves(transaction);
        sandbox.mock(ownershipInfoRepo).expects('save').never();

        const result = await OwnershipInfoService.createFromTransaction(transaction.id)(actionRepo, ownershipInfoRepo, transactionRepo)
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('注文取引の潜在アクションが未定義であればNotFoundエラーとなるはず', async () => {
        const transaction = {
            id: 'transactionId',
            result: {
                ownershipInfos: [{ identifier: 'identifier' }]
            }
            // potentialActions: { order: { potentialActions: { sendOrder: { typeOf: 'actionType' } } } }
        };

        const actionRepo = new ActionRepo(mongoose.connection);
        const ownershipInfoRepo = new OwnershipInfoRepo(mongoose.connection);
        const transactionRepo = new TransactionRepo(mongoose.connection);

        sandbox.mock(actionRepo).expects('start').never();
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once().resolves(transaction);
        sandbox.mock(ownershipInfoRepo).expects('save').never();

        const result = await OwnershipInfoService.createFromTransaction(transaction.id)(actionRepo, ownershipInfoRepo, transactionRepo)
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('所有権保管に失敗すればアクションにエラー結果が追加されるはず', async () => {
        const transaction = {
            id: 'transactionId',
            result: {
                ownershipInfos: [{ identifier: 'identifier' }]
            },
            potentialActions: { order: { potentialActions: { sendOrder: { typeOf: sskts.factory.actionType.SendAction } } } }
        };
        const action = { id: 'actionId', typeOf: transaction.potentialActions.order.potentialActions.sendOrder.typeOf };
        const saveOwnershipInfoResult = new Error('saveOwnershipInfoError');

        const actionRepo = new ActionRepo(mongoose.connection);
        const ownershipInfoRepo = new OwnershipInfoRepo(mongoose.connection);
        const transactionRepo = new TransactionRepo(mongoose.connection);

        sandbox.mock(actionRepo).expects('start').once()
            .withExactArgs(transaction.potentialActions.order.potentialActions.sendOrder).resolves(action);
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once().resolves(transaction);
        sandbox.mock(ownershipInfoRepo).expects('save').once().rejects(saveOwnershipInfoResult);
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(actionRepo).expects('giveUp').once()
            .withArgs(transaction.potentialActions.order.potentialActions.sendOrder.typeOf, action.id).resolves(action);

        const result = await OwnershipInfoService.createFromTransaction(transaction.id)(actionRepo, ownershipInfoRepo, transactionRepo)
            .catch((err) => err);

        assert.deepEqual(result, saveOwnershipInfoResult);
        sandbox.verify();
    });
});
