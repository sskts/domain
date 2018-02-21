/**
 * taskFunctions test
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';

import * as TaskFunctionsService from './taskFunctions';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('TaskFunctionsService.sendEmailNotification()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('通知サービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            emailMessage: { dataKey: 'dataValue' }
        };

        sandbox.mock(sskts.service.notification).expects('sendEmail').once()
            .withArgs(data.emailMessage).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.sendEmailNotification(<any>data)(sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.cancelSeatReservation()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('仮予約解除サービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.stock).expects('cancelSeatReservationAuth').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.cancelSeatReservation(<any>data)(sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.cancelCreditCard()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('クレジットカードオーソリ解除サービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.sales).expects('cancelCreditCardAuth').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.cancelCreditCard(<any>data)(sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.cancelMvtk()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('ムビチケキャンセルサービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.sales).expects('cancelMvtk').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.cancelMvtk(<any>data)(sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.settleSeatReservation()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('本予約サービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.stock).expects('transferSeatReservation').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.settleSeatReservation(<any>data)(sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.settleCreditCard()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('クレジットカード実売上サービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.sales).expects('settleCreditCardAuth').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.settleCreditCard(<any>data)(sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.settleMvtk()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('ムビチケ確定サービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.sales).expects('settleMvtk').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.settleMvtk(<any>data)(sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.createOrder()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('注文作成サービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.order).expects('createFromTransaction').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.createOrder(<any>data)(sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.createOwnershipInfos()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('所有権作成サービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.ownershipInfo).expects('createFromTransaction').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.createOwnershipInfos(<any>data)(sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.sendEmailMessage()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('通知サービスが正常であればエラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId',
            actionAttributes: {}
        };

        sandbox.mock(sskts.service.notification).expects('sendEmailMessage').once()
            .withArgs(data.actionAttributes).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.sendEmailMessage(<any>data)(sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.refundCreditCard()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('売上サービスが正常であればエラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.sales).expects('refundCreditCard').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.refundCreditCard(<any>data)(sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.returnOrder()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('注文サービスが正常であればエラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.order).expects('cancelReservations').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.returnOrder(<any>data)(sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.sendOrder()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('配送サービスが正常であればエラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.delivery).expects('sendOrder').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.sendOrder(<any>data)(sskts.mongoose.connection);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
