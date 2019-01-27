// tslint:disable:no-implicit-dependencies
/**
 * itemAvailability service test
 */
import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.createSandbox();
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
                    listPerformance: [
                        { cntReserveFree: 90, cntReserveMax: 100 },
                        { cntReserveFree: 90, cntReserveMax: 100 }
                    ]
                },
                {
                    listPerformance: [
                        { cntReserveFree: 90, cntReserveMax: 100 },
                        { cntReserveFree: 90, cntReserveMax: 100 }
                    ]
                }
            ]
        };

        const itemAvailabilityRepo = new sskts.repository.itemAvailability.ScreeningEvent(<any>{});
        const numberOfEvents = countFreeSeatResult.listDate.reduce(
            (a, b) => a + b.listPerformance.length,
            0
        );

        sandbox.mock(sskts.COA.services.reserve).expects('countFreeSeat').once()
            .withArgs(sinon.match({ theaterCode: theaterCode })).resolves(countFreeSeatResult);
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
