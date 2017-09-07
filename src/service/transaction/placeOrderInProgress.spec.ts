/**
 * placeOrderInProgress transaction service test
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('start()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('販売者が存在すれば、開始できるはず', async () => {
        const agentId = 'agentId';
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' }
        };
        const transaction = {
            expires: new Date()
        };
        const scope = {};
        const maxCountPerUnit = 999;

        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const transactioCountRepo = new sskts.repository.TransactionCount(sskts.redis.createClient());

        sandbox.mock(transactioCountRepo).expects('incr').once()
            .withExactArgs(scope).returns(Promise.resolve(maxCountPerUnit - 1));
        sandbox.mock(organizationRepo).expects('findMovieTheaterById').once()
            .withExactArgs(seller.id).returns(Promise.resolve(seller));
        sandbox.mock(transactionRepo).expects('startPlaceOrder').once()
            .returns(Promise.resolve());

        const result = await sskts.service.transaction.placeOrderInProgress.start({
            expires: transaction.expires,
            maxCountPerUnit: maxCountPerUnit,
            clientUser: <any>{},
            scope: <any>scope,
            agentId: agentId,
            sellerId: seller.id
        })(organizationRepo, transactionRepo, transactioCountRepo);

        assert.equal(result.expires, transaction.expires);
        sandbox.verify();
    });

    it('取引数制限を超えていれば、エラーが投げられるはず', async () => {
        const agentId = 'agentId';
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' }
        };
        const transaction = {
            expires: new Date()
        };
        const scope = {};
        const maxCountPerUnit = 999;

        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const transactioCountRepo = new sskts.repository.TransactionCount(sskts.redis.createClient());

        sandbox.mock(transactioCountRepo).expects('incr').once()
            .withExactArgs(scope).returns(Promise.resolve(maxCountPerUnit + 1));
        sandbox.mock(organizationRepo).expects('findMovieTheaterById').never();
        sandbox.mock(transactionRepo).expects('startPlaceOrder').never();

        const startError = await sskts.service.transaction.placeOrderInProgress.start({
            expires: transaction.expires,
            maxCountPerUnit: maxCountPerUnit,
            clientUser: <any>{},
            scope: <any>scope,
            agentId: agentId,
            sellerId: seller.id
        })(organizationRepo, transactionRepo, transactioCountRepo)
            .catch((err) => err);

        assert(startError instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });
});

describe('createCreditCardAuthorization()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('GMOが正常であれば、エラーにならないはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            gmoInfo: {
                shopId: 'shopId',
                shopPass: 'shopPass'
            }
        };
        const transaction = {
            id: 'transactionId',
            agent: agent,
            seller: seller
        };
        const orderId = 'orderId';
        const amount = 1234;
        const creditCard = <any>{};
        const entryTranResult = {};
        const execTranResult = {};

        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(organizationRepo).expects('findMovieTheaterById').once()
            .withExactArgs(seller.id).returns(Promise.resolve(seller));
        sandbox.mock(sskts.GMO.services.credit).expects('entryTran').once()
            .returns(Promise.resolve(entryTranResult));
        sandbox.mock(sskts.GMO.services.credit).expects('execTran').once()
            .returns(Promise.resolve(execTranResult));
        sandbox.mock(transactionRepo).expects('pushPaymentInfo').once()
            .withArgs(transaction.id).returns(Promise.resolve());

        const result = await sskts.service.transaction.placeOrderInProgress.createCreditCardAuthorization(
            agent.id,
            transaction.id,
            orderId,
            amount,
            sskts.GMO.utils.util.Method.Lump,
            creditCard
        )(organizationRepo, transactionRepo);

        assert.notEqual(result, undefined);
        sandbox.verify();
    });
});

describe('cancelGMOAuthorization()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('販売者が存在すれば、開始できるはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            gmoInfo: {
                shopId: 'shopId',
                shopPass: 'shopPass'
            }
        };
        const actionId = 'actionId';
        const transaction = {
            id: 'transactionId',
            agent: agent,
            seller: seller,
            object: {
                paymentInfos: [{
                    id: actionId,
                    purpose: {
                        typeOf: sskts.factory.action.authorize.authorizeActionPurpose.CreditCard
                    },
                    object: {
                        entryTranArgs: {},
                        execTranArgs: {}
                    }
                }]
            }
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').once()
            .returns(Promise.resolve());
        sandbox.mock(transactionRepo).expects('pullPaymentInfo').once()
            .withExactArgs(transaction.id, actionId).returns(Promise.resolve());

        const result = await sskts.service.transaction.placeOrderInProgress.cancelGMOAuthorization(
            agent.id,
            transaction.id,
            actionId
        )(transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('createSeatReservationAuthorization()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('COAが正常であれば、エラーにならないはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' }
        };
        const transaction = {
            id: 'transactionId',
            agent: agent,
            seller: seller
        };
        const individualScreeningEvent = {
            coaInfo: {}
        };
        const offers = [{
            seatSection: 'seatSection',
            seatNumber: 'seatNumber'
        }];
        const reserveSeatsTemporarilyResult = <any>{};
        const authorizeAction = {};

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once()
            .returns(Promise.resolve(reserveSeatsTemporarilyResult));
        sandbox.mock(sskts.factory.action.authorize.seatReservation).expects('createFromCOATmpReserve').once()
            .returns(authorizeAction);
        sandbox.mock(transactionRepo).expects('addSeatReservation').once()
            .withArgs(transaction.id, authorizeAction).returns(Promise.resolve());

        const result = await sskts.service.transaction.placeOrderInProgress.createSeatReservationAuthorization(
            agent.id,
            transaction.id,
            <any>individualScreeningEvent,
            <any>offers
        )(transactionRepo);

        assert.notEqual(result, undefined);
        sandbox.verify();
    });
});

describe('cancelSeatReservationAuthorization()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('販売者が存在すれば、開始できるはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' }
        };
        const actionId = 'actionId';
        const transaction = {
            id: 'transactionId',
            agent: agent,
            seller: seller,
            object: {
                seatReservation: {
                    id: actionId,
                    purpose: {
                        typeOf: sskts.factory.action.authorize.authorizeActionPurpose.SeatReservation
                    },
                    object: {
                        updTmpReserveSeatArgs: {}
                    },
                    result: {
                        updTmpReserveSeatResult: {}
                    }
                }
            }
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(sskts.COA.services.reserve).expects('delTmpReserve').once()
            .returns(Promise.resolve());
        sandbox.mock(transactionRepo).expects('removeSeatReservation').once()
            .withExactArgs(transaction.id).returns(Promise.resolve());

        const result = await sskts.service.transaction.placeOrderInProgress.cancelSeatReservationAuthorization(
            agent.id,
            transaction.id,
            actionId
        )(transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
