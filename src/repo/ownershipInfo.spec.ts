/**
 * ownershipInfo repository test
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

describe('save()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('MongoDBの状態が正常であれば、保管できるはず', async () => {
        const ownershipInfo = {};

        const repository = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);

        sandbox.mock(repository.ownershipInfoModel)
            .expects('findOneAndUpdate').once()
            .chain('exec')
            .resolves(new repository.ownershipInfoModel());

        const result = await repository.save(<any>ownershipInfo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
