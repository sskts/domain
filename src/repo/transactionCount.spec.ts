/**
 * transactionCount repository test
 * @ignore
 */

import * as assert from 'power-assert';
import * as redis from 'redis-mock';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('incr()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('Redisの状態が正常であれば、カウントアップできるはず', async () => {
        const scope = {};
        const transactionCount = 123;

        const repository = new sskts.repository.TransactionCount(redis.createClient());
        const multi = redis.createClient().multi();
        multi.expireat = () => multi;
        (<any>multi.exec) = (cb: Function) => cb(null, [transactionCount.toString()]);

        sandbox.mock(repository.redisClient).expects('multi').once().returns(multi);

        const result = await repository.incr(<any>scope);

        assert.equal(typeof result, 'number');
        assert.equal(result, transactionCount);
        sandbox.verify();
    });
});

describe('getByScope()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('Redisの状態が正常であれば、取得できるはず', async () => {
        const scope = {};
        const transactionCount = 123;

        const repository = new sskts.repository.TransactionCount(redis.createClient());
        (<any>repository.redisClient.get) = (__: any, cb: Function) => {
            cb(null, transactionCount.toString());
        };

        // sandbox.mock(repository.redisClient).expects('get').once();

        const result = await repository.getByScope(<any>scope);

        assert.equal(typeof result, 'number');
        assert.equal(result, transactionCount);
        sandbox.verify();
    });
});
