/**
 * masterSync service test
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';

describe('importMovies()', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であればエラーにならないはず', async () => {
        const creativeWorkRepo = sskts.repository.creativeWork(sskts.mongoose.connection);
        sandbox.stub(creativeWorkRepo, 'saveMovie').returns(Promise.resolve());
        sandbox.stub(sskts.COA.services.master, 'title').returns(Promise.resolve([{}]));
        sandbox.stub(sskts.factory.creativeWork.movie, 'createFromCOA').returns({});

        const result = await sskts.service.masterSync.importMovies('123')(creativeWorkRepo);
        assert.equal(result, undefined);
    });
});
