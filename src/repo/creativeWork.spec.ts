/**
 * creativeWork repository test
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

describe('saveMovie()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、エラーにならないはず', async () => {
        const movie = { identifier: 'identifier' };

        const creativeWorkRepo = new sskts.repository.CreativeWork(sskts.mongoose.connection);

        sandbox.mock(creativeWorkRepo.creativeWorkModel)
            .expects('findOneAndUpdate').once()
            .chain('exec')
            .resolves();

        const result = await creativeWorkRepo.saveMovie(<any>movie);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
