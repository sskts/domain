// tslint:disable:no-implicit-dependencies
/**
 * taskFunctions test
 */
import * as AWS from 'aws-sdk';
import * as assert from 'power-assert';
import * as redis from 'redis-mock';
import * as sinon from 'sinon';
import * as sskts from '../index';

import * as TaskFunctionsService from './taskFunctions';

let sandbox: sinon.SinonSandbox;
let pecorinoAuthClient: sskts.pecorinoapi.auth.ClientCredentials;
let redisClient: redis.RedisClient;
let cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider;

before(() => {
    sandbox = sinon.createSandbox();
    pecorinoAuthClient = new sskts.pecorinoapi.auth.ClientCredentials(<any>{});
    redisClient = redis.createClient();
    cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
});

describe('TaskFunctionsService.cancelSeatReservation()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('仮予約解除サービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.stock).expects('cancelSeatReservationAuth').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.cancelSeatReservation(<any>data)({ connection: sskts.mongoose.connection });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.cancelCreditCard()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('クレジットカードオーソリ解除サービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.payment.creditCard).expects('cancelCreditCardAuth').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.cancelCreditCard(<any>data)({ connection: sskts.mongoose.connection });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.cancelMvtk()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('ムビチケキャンセルサービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.discount.mvtk).expects('cancelMvtk').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.cancelMvtk(<any>data)({ connection: sskts.mongoose.connection });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.cancelPecorino()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('Pecorino決済サービスが正常であればエラーにならないはず', async () => {
        const data = {};
        sandbox.mock(sskts.service.payment.pecorino).expects('cancelPecorinoAuth').once().returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.cancelPecorino(<any>data)({
            connection: sskts.mongoose.connection,
            pecorinoAuthClient: pecorinoAuthClient
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.cancelPecorinoAward()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('配送サービスが正常であればエラーにならないはず', async () => {
        const data = {};
        sandbox.mock(sskts.service.delivery).expects('cancelPecorinoAward').once().returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.cancelPecorinoAward(<any>data)({
            connection: sskts.mongoose.connection,
            pecorinoAuthClient: pecorinoAuthClient
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.settleCreditCard()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('クレジットカード実売上サービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.payment.creditCard).expects('payCreditCard').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.payCreditCard(<any>data)({ connection: sskts.mongoose.connection });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.settleMvtk()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('ムビチケ確定サービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.discount.mvtk).expects('useMvtk').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.useMvtk(<any>data)({ connection: sskts.mongoose.connection });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.createOrder()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('注文作成サービスが正常であれば、エラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.order).expects('createFromTransaction').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.placeOrder(<any>data)({ connection: sskts.mongoose.connection });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.sendEmailMessage()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('通知サービスが正常であればエラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId',
            actionAttributes: {}
        };

        sandbox.mock(sskts.service.notification).expects('sendEmailMessage').once()
            .withArgs(data.actionAttributes).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.sendEmailMessage(<any>data)({ connection: sskts.mongoose.connection });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.refundCreditCard()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('売上サービスが正常であればエラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.payment.creditCard).expects('refundCreditCard').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.refundCreditCard(<any>data)({ connection: sskts.mongoose.connection });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.refundPecorino()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('Pecorino決済サービスが正常であればエラーにならないはず', async () => {
        const data = {};
        sandbox.mock(sskts.service.payment.pecorino).expects('refundPecorino').once().returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.refundPecorino(<any>data)({
            connection: sskts.mongoose.connection,
            pecorinoAuthClient: pecorinoAuthClient
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.returnOrder()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('注文サービスが正常であればエラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.order).expects('cancelReservations').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.returnOrder(<any>data)({ connection: sskts.mongoose.connection });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.sendOrder()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('配送サービスが正常であればエラーにならないはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.delivery).expects('sendOrder').once()
            .withArgs(data.transactionId).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.sendOrder(<any>data)({
            connection: sskts.mongoose.connection,
            redisClient: redis.createClient()
        });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.payPecorino()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('決済サービスが正常であればエラーにならないはず', async () => {
        const data = {};
        sandbox.mock(sskts.service.payment.pecorino).expects('payPecorino').once().returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.payPecorino(<any>data)({
            connection: sskts.mongoose.connection,
            pecorinoAuthClient: pecorinoAuthClient
        });

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('PecorinoAPIクライアントがセットされていなければエラーとなるはず', async () => {
        const data = {
            transactionId: 'transactionId'
        };

        sandbox.mock(sskts.service.payment.pecorino).expects('payPecorino').never();

        const result = await TaskFunctionsService.payPecorino(<any>data)({
            connection: sskts.mongoose.connection
        }).catch((err) => err);

        assert(result instanceof Error);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.givePecorinoAward()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('配送サービスが正常であればエラーにならないはず', async () => {
        const data = {};
        sandbox.mock(sskts.service.delivery).expects('givePecorinoAward').once().returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.givePecorinoAward(<any>data)({
            connection: sskts.mongoose.connection,
            pecorinoAuthClient: pecorinoAuthClient
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.returnPecorinoAward()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('配送サービスが正常であればエラーにならないはず', async () => {
        const data = {};
        sandbox.mock(sskts.service.delivery).expects('returnPecorinoAward').once().returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.returnPecorinoAward(<any>data)({
            connection: sskts.mongoose.connection,
            pecorinoAuthClient: pecorinoAuthClient
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.registerProgramMembership()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('会員プログラムサービスが正常であればエラーにならないはず', async () => {
        const data = {};
        sandbox.mock(sskts.service.programMembership).expects('register').once().returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.registerProgramMembership(<any>data)({
            connection: sskts.mongoose.connection,
            redisClient: redisClient,
            cognitoIdentityServiceProvider: cognitoIdentityServiceProvider
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.unRegisterProgramMembership()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('会員プログラムサービスが正常であればエラーにならないはず', async () => {
        const data = {};
        sandbox.mock(sskts.service.programMembership).expects('unRegister').once().returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.unRegisterProgramMembership(<any>data)({
            connection: sskts.mongoose.connection
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.triggerWebhook()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('通知サービスが正常であればエラーにならないはず', async () => {
        const data = {};
        sandbox.mock(sskts.service.notification).expects('triggerWebhook').once()
            .withArgs(data).returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.triggerWebhook(<any>data)({ connection: sskts.mongoose.connection });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('TaskFunctionsService.importScreeningEvents()', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('マスタ同期サービスが正常であればエラーにならないはず', async () => {
        const data = {};
        sandbox.mock(sskts.service.masterSync).expects('importScreeningEvents').once()
            .returns(async () => Promise.resolve());

        const result = await TaskFunctionsService.importScreeningEvents(<any>data)({ connection: sskts.mongoose.connection });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});
