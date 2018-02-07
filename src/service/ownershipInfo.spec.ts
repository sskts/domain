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
            }
        };
        const action = { id: 'actionId' };

        const actionRepo = new ActionRepo(mongoose.connection);
        const ownershipInfoRepo = new OwnershipInfoRepo(mongoose.connection);
        const transactionRepo = new TransactionRepo(mongoose.connection);

        sandbox.mock(actionRepo).expects('start').once()
            .withArgs(sskts.factory.actionType.SendAction).resolves(action);
        sandbox.mock(actionRepo).expects('complete').once()
            .withArgs(sskts.factory.actionType.SendAction, action.id).resolves(action);
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once().resolves(transaction);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(ownershipInfoRepo).expects('save').exactly(transaction.result.ownershipInfos.length).resolves();

        const result = await OwnershipInfoService.createFromTransaction(transaction.id)(actionRepo, ownershipInfoRepo, transactionRepo);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('取引結果がなければ、何もしないはず', async () => {
        const transaction = {
            id: 'transactionId'
        };

        const actionRepo = new ActionRepo(mongoose.connection);
        const ownershipInfoRepo = new OwnershipInfoRepo(mongoose.connection);
        const transactionRepo = new TransactionRepo(mongoose.connection);

        sandbox.mock(actionRepo).expects('start').never();
        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once().resolves(transaction);
        sandbox.mock(ownershipInfoRepo).expects('save').never();

        const result = await OwnershipInfoService.createFromTransaction(transaction.id)(actionRepo, ownershipInfoRepo, transactionRepo);
        assert.equal(result, undefined);
        sandbox.verify();
    });
});
