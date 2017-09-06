/**
 * event service test
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('searchIndividualScreeningEvents()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、エラーにならないはず', async () => {
        const numberOfEvents = 3;
        const event = {
            coaInfo: {
                dateJouei: '20170831'
            },
            identifier: 'identifier'
        };
        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const itemAvailabilityRepo = new sskts.repository.itemAvailability.IndividualScreeningEvent(sskts.redis.createClient());

        sandbox.mock(eventRepo).expects('searchIndividualScreeningEvents').once()
            .returns(Array.from(Array(numberOfEvents)).map(() => event));
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(itemAvailabilityRepo).expects('findOne').exactly(numberOfEvents).returns(100);

        const result = await sskts.service.event.searchIndividualScreeningEvents({
            day: 'day',
            theater: 'theater'
        })(eventRepo, itemAvailabilityRepo);

        assert(Array.isArray(result));
        sandbox.verify();
    });
});

describe('findIndividualScreeningEventByIdentifier()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、エラーにならないはず', async () => {
        const event = {
            coaInfo: {
                dateJouei: '20170831'
            },
            identifier: 'identifier'
        };
        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const itemAvailabilityRepo = new sskts.repository.itemAvailability.IndividualScreeningEvent(sskts.redis.createClient());

        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once().returns(event);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(itemAvailabilityRepo).expects('findOne').once().returns(100);

        const result = await sskts.service.event.findIndividualScreeningEventByIdentifier(
            event.identifier
        )(eventRepo, itemAvailabilityRepo);

        assert.equal(result.identifier, event.identifier);
        sandbox.verify();
    });
});
