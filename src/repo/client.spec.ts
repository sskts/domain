// tslint:disable:no-implicit-dependencies

/**
 * client repository test
 * @ignore
 */

import { } from 'mocha';
import * as assert from 'power-assert';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.createSandbox();
});

describe('pushEvent()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、objectが返却されるはず', async () => {
        const params = {};

        const repository = new sskts.repository.Client(sskts.mongoose.connection);

        sandbox.mock(repository.clientEventModel)
            .expects('create').once()
            .resolves(new repository.clientEventModel());

        const result = await repository.pushEvent(<any>params);

        assert.notEqual(result, undefined);
        sandbox.verify();
    });
});
