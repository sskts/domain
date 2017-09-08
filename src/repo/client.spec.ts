/**
 * client repository test
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

describe('pushEvent()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、objectが返却されるはず', async () => {
        const params = {};
        const clientEvent = {
            id: 'clientEventId'
        };

        const repository = new sskts.repository.Client(sskts.mongoose.connection);

        sandbox.mock(sskts.factory.clientEvent).expects('create').once()
            .returns(clientEvent);
        sandbox.mock(repository.clientEventModel)
            .expects('findByIdAndUpdate').once().withArgs(clientEvent.id)
            .chain('exec').resolves();

        const result = await repository.pushEvent(<any>params);

        assert.deepEqual(result, clientEvent);
        sandbox.verify();
    });
});
