// tslint:disable:no-implicit-dependencies
/**
 * itemAvailability service test
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('updatePerformanceStockStatuses()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('COAから取得したイベントの数だけ在庫が更新されるはず', async () => {
        const theaterCode = 'theaterCode';
        const startFrom = new Date();
        const startThrough = new Date();
        const countFreeSeatResult = {
            theaterCode: theaterCode,
            listDate: [
                {
                    listPerformance: [{}, {}]
                },
                {
                    listPerformance: [{}, {}]
                }
            ]
        };
        const availability = 100;

        const itemAvailabilityRepo = new sskts.repository.itemAvailability.IndividualScreeningEvent(<any>{});
        const numberOfEvents = countFreeSeatResult.listDate.reduce(
            (a, b) => a + b.listPerformance.length,
            0
        );

        sandbox.mock(sskts.COA.services.reserve).expects('countFreeSeat').once()
            .withArgs(sinon.match({ theaterCode: theaterCode })).resolves(countFreeSeatResult);
        sandbox.mock(sskts.factory.event.individualScreeningEvent).expects('createItemAvailability').exactly(numberOfEvents)
            .returns(availability);
        sandbox.mock(itemAvailabilityRepo).expects('updateOne').exactly(numberOfEvents)
            .resolves();

        const result = await sskts.service.itemAvailability.updateIndividualScreeningEvents(
            theaterCode,
            startFrom,
            startThrough
        )({ itemAvailability: itemAvailabilityRepo });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
