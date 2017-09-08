/**
 * individualScreeningEvent itemAvailability repository test
 * @ignore
 */

import * as assert from 'power-assert';
import * as redis from 'redis-mock';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');
import * as sskts from '../../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('findOne()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('データが存在すれば、数値が返却されるはず', async () => {
        const screeningDay = 'screeningDay';
        const eventIdentifier = 'eventIdentifier';
        const availability = 99;

        const repository = new sskts.repository.itemAvailability.IndividualScreeningEvent(redis.createClient());
        (<any>repository.redisClient.hget) = (__: any, cb: Function) => {
            cb(null, new Buffer(availability.toString()));
        };

        const result = await repository.findOne(screeningDay, eventIdentifier);

        assert.equal(typeof result, 'number');
        assert.equal(result, availability);
        sandbox.verify();
    });
});

describe('updateOne()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('Redisの状態が正常であれば、エラーにならないはず', async () => {
        const screeningDay = 'screeningDay';
        const eventIdentifier = 'eventIdentifier';
        const availability = 99;

        const repository = new sskts.repository.itemAvailability.IndividualScreeningEvent(redis.createClient());
        (<any>repository.redisClient.hset) = (__: any, cb: Function) => {
            cb(null);
        };

        const result = await repository.updateOne(screeningDay, eventIdentifier, availability);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('removeByPerformaceDay()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('Redisの状態が正常であれば、エラーにならないはず', async () => {
        const screeningDay = 'screeningDay';

        const repository = new sskts.repository.itemAvailability.IndividualScreeningEvent(redis.createClient());
        (<any>repository.redisClient.del) = (__: any, cb: Function) => {
            cb(null);
        };

        const result = await repository.removeByPerformaceDay(screeningDay);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('setTTLIfNotExist()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('期限が未設定であれば、セットされるはず', async () => {
        const screeningDay = 'screeningDay';

        const repository = new sskts.repository.itemAvailability.IndividualScreeningEvent(redis.createClient());
        (<any>repository.redisClient.ttl) = (__: any, cb: Function) => {
            cb(null, -1);
        };
        (<any>repository.redisClient.expire) = (__: any, cb: Function) => {
            cb(null);
        };

        const result = await repository.setTTLIfNotExist(screeningDay);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
