/**
 * event repository test
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

describe('saveScreeningEvent()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、保管できるはず', async () => {
        const event = { identifier: 'identifier' };

        const repository = new sskts.repository.Event(sskts.mongoose.connection);

        sandbox.mock(repository.eventModel)
            .expects('findOneAndUpdate').once()
            .chain('exec')
            .resolves();

        const result = await repository.saveScreeningEvent(<any>event);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('saveIndividualScreeningEvent()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、保管できるはず', async () => {
        const event = { identifier: 'identifier' };

        const repository = new sskts.repository.Event(sskts.mongoose.connection);

        sandbox.mock(repository.eventModel)
            .expects('findOneAndUpdate').once()
            .chain('exec')
            .resolves();

        const result = await repository.saveIndividualScreeningEvent(<any>event);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('searchIndividualScreeningEvents()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、配列が返却されるはず', async () => {
        const conditions = {};
        const numberOfEvents = 123;

        const repository = new sskts.repository.Event(sskts.mongoose.connection);

        sandbox.mock(repository.eventModel)
            .expects('find').once()
            .chain('exec')
            .resolves(Promise.resolve(Array.from(Array(numberOfEvents).map(() => new Object()))));

        const result = await repository.searchIndividualScreeningEvents(<any>conditions);

        assert(Array.isArray(result));
        assert.equal(result.length, numberOfEvents);
        sandbox.verify();
    });
});

describe('findIndividualScreeningEventByIdentifier()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、オブジェクトが返却されるはず', async () => {
        const identifier = 'identifier';

        const repository = new sskts.repository.Event(sskts.mongoose.connection);

        sandbox.mock(repository.eventModel)
            .expects('findOne').once()
            .chain('exec')
            .resolves(Promise.resolve(new Object()));

        const result = await repository.findIndividualScreeningEventByIdentifier(identifier);

        assert.equal(typeof result, 'object');
        sandbox.verify();
    });
});
