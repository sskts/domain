/**
 * gmoNotification repository test
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

describe('constructor()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('インスタンス生成できるはず', async () => {
        const creativeWorkRepo = new sskts.repository.GMONotification(sskts.mongoose.connection);

        assert.notEqual(creativeWorkRepo.gmoNotificationModel, undefined);
    });
});

describe('GMONotificationRepo.save()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、エラーにならないはず', async () => {
        const notification = {};
        const gmoNotificationRepo = new sskts.repository.GMONotification(sskts.mongoose.connection);

        sandbox.mock(gmoNotificationRepo.gmoNotificationModel).expects('create').once().resolves();

        const result = await gmoNotificationRepo.save(<any>notification);
        assert.equal(result, undefined);
        sandbox.verify();
    });
});
