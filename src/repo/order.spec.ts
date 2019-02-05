// tslint:disable:no-implicit-dependencies
/**
 * 注文リポジトリテスト
 */
import { } from 'mocha';
import * as mongoose from 'mongoose';
import * as assert from 'power-assert';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.createSandbox();
});

describe('findByLocationBranchCodeAndReservationNumber()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('注文が存在すれば、取得できるはず', async () => {
        const orderInquiryKey = {
            theaterCode: '111',
            confirmationNumber: 123,
            telephone: '+819012345678'
        };

        const repository = new sskts.repository.Order(mongoose.connection);

        sandbox.mock(repository.orderModel).expects('findOne').once()
            .chain('exec').resolves(new repository.orderModel());

        const result = await repository.findByLocationBranchCodeAndReservationNumber(orderInquiryKey);

        assert.notEqual(result, undefined);
        sandbox.verify();
    });

    it('存在しなければ、NotFoundエラーとなるはず', async () => {
        const orderInquiryKey = {
            theaterCode: '111',
            confirmationNumber: 123,
            telephone: '+819012345678'
        };

        const repository = new sskts.repository.Order(mongoose.connection);

        sandbox.mock(repository.orderModel).expects('findOne').once()
            .chain('exec').resolves(null);

        const result = await repository.findByLocationBranchCodeAndReservationNumber(orderInquiryKey).catch((err) => err);
        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });
});
