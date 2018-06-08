// tslint:disable:no-implicit-dependencies
/**
 * ownershipInfo repository test
 * @ignore
 */
import * as factory from '@motionpicture/sskts-factory';
import { } from 'mocha';
import * as mongoose from 'mongoose';
import * as assert from 'power-assert';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');

import { MongoRepository as OwnershipInfoRepo } from './ownershipInfo';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.createSandbox();
});

describe('OwnershipInfoRepo.save()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('MongoDBの状態が正常であれば、保管できるはず', async () => {
        const ownershipInfo = {};

        const repository = new OwnershipInfoRepo(mongoose.connection);

        sandbox.mock(repository.ownershipInfoModel)
            .expects('findOneAndUpdate').once()
            .chain('exec')
            .resolves(new repository.ownershipInfoModel());

        const result = await repository.save(<any>ownershipInfo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('所有権検索', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('MongoDBの状態が正常であれば、配列を返すはず', async () => {
        const searchConditions = {
            goodType: factory.reservationType.EventReservation,
            ownedBy: '',
            ownedAt: new Date()
        };
        const repository = new OwnershipInfoRepo(mongoose.connection);
        const docs = [new repository.ownershipInfoModel()];

        sandbox.mock(repository.ownershipInfoModel).expects('find').once()
            .chain('exec').resolves(docs);

        const result = await repository.search(searchConditions);
        assert(Array.isArray(result));
        assert.equal(result.length, docs.length);
        sandbox.verify();
    });
});
