/**
 * stock service test
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('executeByName()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    // it('未実行タスクが存在すれば、実行されるはず', async () => {
    //     const task = {};
    //     const taskName = sskts.factory.taskName.CreateOrder;
    //     const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

    //     sandbox.mock(taskRepo).expects('executeOneByName').once()
    //         .withArgs(taskName).returns(Promise.resolve(task));
    //     // sandbox.stub(sskts.service.task, 'execute').callThrough();
    //     // .returns(async (__1: any, __2: any) => { return; });
    //     sandbox.mock(sskts.service.task).expects('execute').once()
    //         .withArgs(task);
    //         .returns(async () => { console.log('test'); });

    //     const result = await sskts.service.task.executeByName(taskName)(taskRepo, sskts.mongoose.connection);

    //     assert.equal(result, undefined);
    //     sandbox.verify();
    // });

    it('未実行タスクが存在しなければ、実行されないはず', async () => {
        const taskName = sskts.factory.taskName.CreateOrder;
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(taskRepo).expects('executeOneByName').once()
            .withArgs(taskName).returns(Promise.reject(new sskts.factory.errors.NotFound('task')));
        sandbox.mock(sskts.service.task).expects('execute').never();

        const result = await sskts.service.task.executeByName(taskName)(taskRepo, sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('retry()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、エラーにならないはず', async () => {
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(taskRepo).expects('retry').once()
            .returns(Promise.resolve());

        // tslint:disable-next-line:no-magic-numbers
        const result = await sskts.service.task.retry(10)(taskRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
