/**
 * masterSync service test
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';

import { StubRepository as CreativeWorkRepository } from '../repo/creativeWork';
import { StubRepository as EventRepository } from '../repo/event';
import { StubRepository as PlaceRepository } from '../repo/place';

describe('importMovies()', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、エラーにならないはず', async () => {
        const numberOfWorks = 3;
        const creativeWorkRepo = new CreativeWorkRepository();
        const spy = sandbox.spy(creativeWorkRepo, 'saveMovie');
        sandbox.stub(sskts.COA.services.master, 'title').returns(Promise.resolve(Array.from(Array(numberOfWorks))));
        sandbox.stub(sskts.factory.creativeWork.movie, 'createFromCOA').returns({});

        const result = await sskts.service.masterSync.importMovies('123')(creativeWorkRepo);
        assert.equal(result, undefined);
        assert.equal(spy.callCount, numberOfWorks);
    });
});

describe('importScreeningEvents()', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、エラーにならないはず', async () => {
        const numberOfEvents = 3;
        const eventRepo = new EventRepository();
        const placeRepo = new PlaceRepository();

        const spy = sandbox.spy(eventRepo, 'saveIndividualScreeningEvent');
        sandbox.stub(sskts.COA.services.master, 'title').returns(Promise.resolve(
            Array.from(Array(numberOfEvents)).map(() => new Object())
        ));
        // tslint:disable-next-line:max-line-length
        // tslint:disable-next-line:no-magic-numbers
        sandbox.stub(sskts.COA.services.master, 'schedule').returns(Promise.resolve(Array.from(Array(3)).map(() => new Object())));
        // tslint:disable-next-line:no-magic-numbers
        sandbox.stub(sskts.COA.services.master, 'kubunName').returns(Promise.resolve(Array.from(Array(3)).map(() => new Object())));
        sandbox.stub(sskts.factory.event.screeningEvent, 'createFromCOA').returns({});
        sandbox.stub(sskts.factory.event.screeningEvent, 'createIdentifier').returns('');
        sandbox.stub(sskts.factory.event.individualScreeningEvent, 'createFromCOA').returns({});
        sandbox.stub(Array.prototype, 'find').returns({});

        const result = await sskts.service.masterSync.importScreeningEvents(
            '123', new Date(), new Date()
        )(eventRepo, placeRepo);
        assert.equal(result, undefined);
        assert.equal(spy.callCount, numberOfEvents);
    });
});

describe('importMovieTheater()', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、エラーにならないはず', async () => {
        const placeRepo = new PlaceRepository();

        const spy = sandbox.spy(placeRepo, 'saveMovieTheater');
        sandbox.stub(sskts.COA.services.master, 'theater').returns({});
        sandbox.stub(sskts.COA.services.master, 'screen').returns({});
        sandbox.stub(sskts.factory.place.movieTheater, 'createFromCOA').returns({});

        const result = await sskts.service.masterSync.importMovieTheater('123')(placeRepo);
        assert.equal(result, undefined);
        assert(spy.calledOnce);
    });
});
