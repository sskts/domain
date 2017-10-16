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

        sandbox.mock(transactioCountRepo).expects('incr').once().withExactArgs(scope).resolves(maxCountPerUnit - 1);
        sandbox.mock(organizationRepo).expects('findMovieTheaterById').once().withExactArgs(seller.id).resolves(seller);
        sandbox.mock(transactionRepo).expects('startPlaceOrder').once().resolves(transaction);

        const result = await sskts.service.transaction.placeOrderInProgress.start({
            expires: transaction.expires,
            maxCountPerUnit: maxCountPerUnit,
            clientUser: <any>{},
            scope: <any>scope,
            agentId: agentId,
            sellerId: seller.id
        })(organizationRepo, transactionRepo, transactioCountRepo);

        assert.deepEqual(result, transaction);
        // assert.equal(result.expires, transaction.expires);
        sandbox.verify();
    });

    it('クライアントユーザーにusernameが存在すれば、会員として開始できるはず', async () => {
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
        const clientUser = {
            username: 'username'
        };

        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const transactioCountRepo = new sskts.repository.TransactionCount(sskts.redis.createClient());

        sandbox.mock(transactioCountRepo).expects('incr').once().withExactArgs(scope).resolves(maxCountPerUnit - 1);
        sandbox.mock(organizationRepo).expects('findMovieTheaterById').once().withExactArgs(seller.id).resolves(seller);
        sandbox.mock(transactionRepo).expects('startPlaceOrder').once().resolves(transaction);

        const result = await sskts.service.transaction.placeOrderInProgress.start({
            expires: transaction.expires,
            maxCountPerUnit: maxCountPerUnit,
            clientUser: <any>clientUser,
            scope: <any>scope,
            agentId: agentId,
            sellerId: seller.id
        })(organizationRepo, transactionRepo, transactioCountRepo);

        assert.deepEqual(result, transaction);
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

        sandbox.mock(transactioCountRepo).expects('incr').once().withExactArgs(scope).resolves(maxCountPerUnit + 1);
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

        assert(startError instanceof sskts.factory.errors.ServiceUnavailable);
        sandbox.verify();
    });
});

describe('authorizeCreditCard()', () => {
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
        const action = {
            id: 'actionId',
            agent: agent,
            recipient: seller
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('startCreditCard').once().resolves(action);
        sandbox.mock(organizationRepo).expects('findMovieTheaterById').once().withExactArgs(seller.id).resolves(seller);
        sandbox.mock(sskts.GMO.services.credit).expects('entryTran').once().resolves(entryTranResult);
        sandbox.mock(sskts.GMO.services.credit).expects('execTran').once().resolves(execTranResult);
        sandbox.mock(authorizeActionRepo).expects('completeCreditCard').once().resolves(action);

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeCreditCard(
            agent.id,
            transaction.id,
            orderId,
            amount,
            sskts.GMO.utils.util.Method.Lump,
            creditCard
        )(authorizeActionRepo, organizationRepo, transactionRepo);

        assert.deepEqual(result, action);
        sandbox.verify();
    });

    it('所有者の取引でなければ、Forbiddenエラーが投げられるはず', async () => {
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
            agent: {
                id: 'anotherAgentId'
            },
            seller: seller
        };
        const orderId = 'orderId';
        const amount = 1234;
        const creditCard = <any>{};

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('startCreditCard').never();
        sandbox.mock(organizationRepo).expects('findMovieTheaterById').never();
        sandbox.mock(sskts.GMO.services.credit).expects('entryTran').never();
        sandbox.mock(sskts.GMO.services.credit).expects('execTran').never();

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeCreditCard(
            agent.id,
            transaction.id,
            orderId,
            amount,
            sskts.GMO.utils.util.Method.Lump,
            creditCard
        )(authorizeActionRepo, organizationRepo, transactionRepo)
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });

    it('GMOでエラーが発生すれば、承認アクションを諦めて、エラーとなるはず', async () => {
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
        const action = {
            id: 'actionId',
            agent: agent,
            recipient: seller
        };
        const entryTranResult = new Error('entryTranResultError');

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('startCreditCard').once().resolves(action);
        sandbox.mock(organizationRepo).expects('findMovieTheaterById').once().withExactArgs(seller.id).resolves(seller);
        sandbox.mock(sskts.GMO.services.credit).expects('entryTran').once().rejects(entryTranResult);
        sandbox.mock(sskts.GMO.services.credit).expects('execTran').never();
        sandbox.mock(authorizeActionRepo).expects('giveUp').once().resolves(action);
        sandbox.mock(authorizeActionRepo).expects('completeCreditCard').never();

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeCreditCard(
            agent.id,
            transaction.id,
            orderId,
            amount,
            sskts.GMO.utils.util.Method.Lump,
            creditCard
        )(authorizeActionRepo, organizationRepo, transactionRepo).catch((err) => err);

        assert(result instanceof Error);
        sandbox.verify();
    });

    it('GMOで流量制限オーバーエラーが発生すれば、承認アクションを諦めて、ServiceUnavailableエラーとなるはず', async () => {
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
        const action = {
            id: 'actionId',
            agent: agent,
            recipient: seller
        };
        const entryTranResult = {
            name: 'GMOServiceBadRequestError',
            errors: [{
                info: 'E92000001'
            }]
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('startCreditCard').once().resolves(action);
        sandbox.mock(organizationRepo).expects('findMovieTheaterById').once().withExactArgs(seller.id).resolves(seller);
        sandbox.mock(sskts.GMO.services.credit).expects('entryTran').once().rejects(entryTranResult);
        sandbox.mock(sskts.GMO.services.credit).expects('execTran').never();
        sandbox.mock(authorizeActionRepo).expects('giveUp').once().resolves(action);
        sandbox.mock(authorizeActionRepo).expects('completeCreditCard').never();

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeCreditCard(
            agent.id,
            transaction.id,
            orderId,
            amount,
            sskts.GMO.utils.util.Method.Lump,
            creditCard
        )(authorizeActionRepo, organizationRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.ServiceUnavailable);
        sandbox.verify();
    });

    it('GMOでオーダーID重複エラーが発生すれば、承認アクションを諦めて、ServiceUnavailableエラーとなるはず', async () => {
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
        const action = {
            id: 'actionId',
            agent: agent,
            recipient: seller
        };
        const entryTranResult = {
            name: 'GMOServiceBadRequestError',
            errors: [{
                info: 'E01040010'
            }]
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('startCreditCard').once().resolves(action);
        sandbox.mock(organizationRepo).expects('findMovieTheaterById').once().withExactArgs(seller.id).resolves(seller);
        sandbox.mock(sskts.GMO.services.credit).expects('entryTran').once().rejects(entryTranResult);
        sandbox.mock(sskts.GMO.services.credit).expects('execTran').never();
        sandbox.mock(authorizeActionRepo).expects('giveUp').once().resolves(action);
        sandbox.mock(authorizeActionRepo).expects('completeCreditCard').never();

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeCreditCard(
            agent.id,
            transaction.id,
            orderId,
            amount,
            sskts.GMO.utils.util.Method.Lump,
            creditCard
        )(authorizeActionRepo, organizationRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.AlreadyInUse);
        sandbox.verify();
    });

    it('GMOServiceBadRequestErrorエラーが発生すれば、承認アクションを諦めて、Argumentエラーとなるはず', async () => {
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
        const action = {
            id: 'actionId',
            agent: agent,
            recipient: seller
        };
        const entryTranResult = {
            name: 'GMOServiceBadRequestError',
            errors: [{
                info: 'info'
            }]
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('startCreditCard').once().resolves(action);
        sandbox.mock(organizationRepo).expects('findMovieTheaterById').once().withExactArgs(seller.id).resolves(seller);
        sandbox.mock(sskts.GMO.services.credit).expects('entryTran').once().rejects(entryTranResult);
        sandbox.mock(sskts.GMO.services.credit).expects('execTran').never();
        sandbox.mock(authorizeActionRepo).expects('giveUp').once().resolves(action);
        sandbox.mock(authorizeActionRepo).expects('completeCreditCard').never();

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeCreditCard(
            agent.id,
            transaction.id,
            orderId,
            amount,
            sskts.GMO.utils.util.Method.Lump,
            creditCard
        )(authorizeActionRepo, organizationRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });
});

describe('cancelCreditCardAuth()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('アクションが存在すれば、キャンセルできるはず', async () => {
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
        const action = {
            id: 'actionId',
            result: {
                execTranArgs: {},
                entryTranArgs: {}
            }
        };
        const transaction = {
            id: 'transactionId',
            agent: agent,
            seller: seller
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('cancelCreditCard').once()
            .withExactArgs(action.id, transaction.id).resolves(action);
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').once().resolves();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelCreditCardAuth(
            agent.id,
            transaction.id,
            action.id
        )(authorizeActionRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('所有者の取引でなければ、Forbiddenエラーが投げられるはず', async () => {
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
            agent: {
                id: 'anotherAgentId'
            },
            seller: seller
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('cancelCreditCard').never();
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').never();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelCreditCardAuth(
            agent.id,
            transaction.id,
            actionId
        )(authorizeActionRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });

    it('GMOで取消に失敗しても、エラーにならないはず', async () => {
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
        const action = {
            id: 'actionId',
            result: {
                execTranArgs: {},
                entryTranArgs: {}
            }
        };
        const transaction = {
            id: 'transactionId',
            agent: agent,
            seller: seller
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('cancelCreditCard').once()
            .withExactArgs(action.id, transaction.id).resolves(action);
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').once().rejects();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelCreditCardAuth(
            agent.id,
            transaction.id,
            action.id
        )(authorizeActionRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('authorizeSeatReservation()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('COAが正常であれば、エラーにならないはず(ムビチケなし)', async () => {
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
            seatNumber: 'seatNumber',
            ticketInfo: {
                ticketCode: 'ticketCode',
                salePrice: 123
                // mvtkAppPrice: 123
            }
        }];
        const salesTickets = [{ ticketCode: offers[0].ticketInfo.ticketCode }];
        const reserveSeatsTemporarilyResult = <any>{};
        const action = {
            id: 'actionId'
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once()
            .withArgs(transaction.seller, transaction.agent).resolves(action);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().resolves(reserveSeatsTemporarilyResult);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').once().withArgs(action.id).resolves(action);

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeSeatReservation(
            agent.id,
            transaction.id,
            <any>individualScreeningEvent,
            <any>offers
        )(authorizeActionRepo, transactionRepo);

        assert.deepEqual(result, action);
        sandbox.verify();
    });

    it('COAが正常であれば、エラーにならないはず(ムビチケの場合)', async () => {
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
            coaInfo: {
                theaterCode: 'theaterCode'
            }
        };
        const offers = [{
            seatSection: 'seatSection',
            seatNumber: 'seatNumber',
            ticketInfo: {
                ticketCode: 'ticketCode',
                salePrice: 123,
                mvtkAppPrice: 123
            }
        }];
        const salesTickets = [{ ticketCode: offers[0].ticketInfo.ticketCode }];
        const reserveSeatsTemporarilyResult = <any>{};
        const action = {
            id: 'actionId'
        };
        const mvtkTicket = {
            ticketCode: 'ticketCode'
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once()
            .withArgs(transaction.seller, transaction.agent).resolves(action);
        sandbox.mock(sskts.COA.services.master).expects('mvtkTicketcode').once().resolves(mvtkTicket);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().resolves(reserveSeatsTemporarilyResult);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').once().withArgs(action.id).resolves(action);

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeSeatReservation(
            agent.id,
            transaction.id,
            <any>individualScreeningEvent,
            <any>offers
        )(authorizeActionRepo, transactionRepo);

        assert.deepEqual(result, action);
        sandbox.verify();
    });

    it('COAが正常であれば、エラーにならないはず(会員の場合)', async () => {
        const agent = {
            id: 'agentId',
            memberOf: {} // 会員
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
            seatNumber: 'seatNumber',
            ticketInfo: {
                ticketCode: 'ticketCode',
                salePrice: 123
            }
        }];
        const salesTickets = [{ ticketCode: offers[0].ticketInfo.ticketCode }];
        const reserveSeatsTemporarilyResult = <any>{};
        const action = {
            id: 'actionId'
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once()
            .withArgs(transaction.seller, transaction.agent).resolves(action);
        // 会員と非会員で2回呼ばれるはず
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').twice().resolves(salesTickets);
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().resolves(reserveSeatsTemporarilyResult);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').once().withArgs(action.id).resolves(action);

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeSeatReservation(
            agent.id,
            transaction.id,
            <any>individualScreeningEvent,
            <any>offers
        )(authorizeActionRepo, transactionRepo);

        assert.deepEqual(result, action);
        sandbox.verify();
    });

    it('存在しないチケットコードであれば、エラーになるはず(ムビチケの場合)', async () => {
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
            coaInfo: {
                theaterCode: 'theaterCode'
            }
        };
        const offers = [{
            seatSection: 'seatSection',
            seatNumber: 'seatNumber',
            ticketInfo: {
                ticketCode: 'invalidTicketCode',
                salePrice: 123,
                mvtkAppPrice: 123
            }
        }];
        const salesTickets = [{ ticketCode: 'ticketCode' }];
        const mvtkTicket = {
            ticketCode: 'ticketCode'
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(sskts.COA.services.master).expects('mvtkTicketcode').once().resolves(mvtkTicket);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').never();
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeSeatReservation(
            agent.id,
            transaction.id,
            <any>individualScreeningEvent,
            <any>offers
        )(authorizeActionRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('存在しないチケットコードであれば、エラーになるはず(ムビチケなし)', async () => {
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
            seatNumber: 'seatNumber',
            ticketInfo: {
                ticketCode: 'invalidTicketCode',
                salePrice: 123
            }
        }];
        const salesTickets = [{ ticketCode: 'ticketCode' }];

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').never();
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeSeatReservation(
            agent.id,
            transaction.id,
            <any>individualScreeningEvent,
            <any>offers
        )(authorizeActionRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('所有者の取引でなければ、Forbiddenエラーが投げられるはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' }
        };
        const transaction = {
            id: 'transactionId',
            agent: {
                id: 'anotherAgentId'
            },
            seller: seller
        };
        const individualScreeningEvent = {
            coaInfo: {}
        };
        const offers = [{
            seatSection: 'seatSection',
            seatNumber: 'seatNumber',
            ticketInfo: {
                salePrice: 123,
                mvtkSalesPrice: 123
            }
        }];

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').never();

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeSeatReservation(
            agent.id,
            transaction.id,
            <any>individualScreeningEvent,
            <any>offers
        )(authorizeActionRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });

    it('COA仮予約が原因不明のサーバーエラーであれば、承認アクションを諦めて、ServiceUnavailableエラーになるはず', async () => {
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
            seatNumber: 'seatNumber',
            ticketInfo: {
                ticketCode: 'ticketCode',
                salePrice: 123
            }
        }];
        const salesTickets = [{ ticketCode: 'ticketCode' }];
        const action = {
            id: 'actionId'
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once().resolves(action);
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().rejects();
        // giveUpが呼ばれて、completeは呼ばれないはず
        sandbox.mock(authorizeActionRepo).expects('giveUp').once().withArgs(action.id).resolves(action);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeSeatReservation(
            agent.id,
            transaction.id,
            <any>individualScreeningEvent,
            <any>offers
        )(authorizeActionRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.ServiceUnavailable);
        sandbox.verify();
    });

    it('COA仮予約が座席重複エラーであれば、承認アクションを諦めて、AlreadyInUseエラーになるはず', async () => {
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
            seatNumber: 'seatNumber',
            ticketInfo: {
                ticketCode: 'ticketCode',
                salePrice: 123
            }
        }];
        const salesTickets = [{ ticketCode: 'ticketCode' }];
        const action = {
            id: 'actionId'
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once().resolves(action);
        // COAが座席取得失敗エラーを返してきた場合
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().rejects(new Error('座席取得失敗'));
        // giveUpが呼ばれて、completeは呼ばれないはず
        sandbox.mock(authorizeActionRepo).expects('giveUp').once().withArgs(action.id).resolves(action);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeSeatReservation(
            agent.id,
            transaction.id,
            <any>individualScreeningEvent,
            <any>offers
        )(authorizeActionRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.AlreadyInUse);
        sandbox.verify();
    });

    it('COA仮予約が500未満のエラーであれば、承認アクションを諦めて、Argumentエラーになるはず', async () => {
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
            seatNumber: 'seatNumber',
            ticketInfo: {
                ticketCode: 'ticketCode',
                salePrice: 123
            }
        }];
        const salesTickets = [{ ticketCode: 'ticketCode' }];
        const action = {
            id: 'actionId'
        };
        const updTmpReserveSeatResult = { code: 200 };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once().resolves(action);
        // COAが座席取得失敗エラーを返してきた場合
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().rejects(updTmpReserveSeatResult);
        // giveUpが呼ばれて、completeは呼ばれないはず
        sandbox.mock(authorizeActionRepo).expects('giveUp').once().withArgs(action.id).resolves(action);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeSeatReservation(
            agent.id,
            transaction.id,
            <any>individualScreeningEvent,
            <any>offers
        )(authorizeActionRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });

    it('COA仮予約が500以上のエラーであれば、承認アクションを諦めて、Argumentエラーになるはず', async () => {
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
            seatNumber: 'seatNumber',
            ticketInfo: {
                ticketCode: 'ticketCode',
                salePrice: 123
            }
        }];
        const salesTickets = [{ ticketCode: 'ticketCode' }];
        const action = {
            id: 'actionId'
        };
        const updTmpReserveSeatResult = { code: 500 };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once().resolves(action);
        // COAが座席取得失敗エラーを返してきた場合
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().rejects(updTmpReserveSeatResult);
        // giveUpが呼ばれて、completeは呼ばれないはず
        sandbox.mock(authorizeActionRepo).expects('giveUp').once().withArgs(action.id).resolves(action);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeSeatReservation(
            agent.id,
            transaction.id,
            <any>individualScreeningEvent,
            <any>offers
        )(authorizeActionRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.ServiceUnavailable);
        sandbox.verify();
    });
});

describe('cancelSeatReservationAuth()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('アクションが存在すれば、キャンセルできるはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' }
        };
        const action = {
            id: 'actionId',
            result: {
                updTmpReserveSeatArgs: {},
                updTmpReserveSeatResult: {}
            }
        };
        const transaction = {
            id: 'transactionId',
            agent: agent,
            seller: seller
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('cancelSeatReservation').once()
            .withExactArgs(action.id, transaction.id).resolves(action);
        sandbox.mock(sskts.COA.services.reserve).expects('delTmpReserve').once().resolves();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelSeatReservationAuth(
            agent.id,
            transaction.id,
            action.id
        )(authorizeActionRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('所有者の取引でなければ、Forbiddenエラーが投げられるはず', async () => {
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
            agent: {
                id: 'anotherAgentId'
            },
            seller: seller
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('cancelSeatReservation').never();
        sandbox.mock(sskts.COA.services.reserve).expects('delTmpReserve').never();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelSeatReservationAuth(
            agent.id,
            transaction.id,
            actionId
        )(authorizeActionRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});

describe('authorizeMvtk()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('座席予約とムビチケ情報の整合性が合えば、エラーにならないはず', async () => {
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
        const authorizeObject = {
            seatInfoSyncIn: {
                stCd: '18',
                skhnCd: '1234500',
                screnCd: '01',
                knyknrNoInfo: [
                    {
                        knyknrNo: '12345',
                        knshInfo: [
                            {
                                miNum: 1
                            }
                        ]
                    }
                ],
                zskInfo: []
            }
        };
        const seatReservationAuthorizeAction = {
            id: 'actionId',
            object: {
                offers: [
                    {
                        ticketInfo: {
                            mvtkNum: '12345'
                        }
                    },
                    {
                        ticketInfo: {
                            mvtkNum: ''
                        }
                    }
                ]
            },
            result: {
                acceptedOffers: [],
                updTmpReserveSeatArgs: {
                    theaterCode: '118',
                    titleCode: '12345',
                    titleBranchNum: '0',
                    screenCode: '01'
                },
                updTmpReserveSeatResult: {
                    listTmpReserve: []
                }
            }
        };
        const action = {
            id: 'actionId'
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('findSeatReservationByTransactionId').once()
            .withExactArgs(transaction.id).resolves(seatReservationAuthorizeAction);
        sandbox.mock(authorizeActionRepo).expects('startMvtk').once()
            .withArgs(transaction.agent, transaction.seller).resolves(action);
        sandbox.mock(authorizeActionRepo).expects('completeMvtk').once().withArgs(action.id).resolves(action);

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeMvtk(
            agent.id,
            transaction.id,
            <any>authorizeObject
        )(authorizeActionRepo, transactionRepo);

        assert.deepEqual(result, action);
        sandbox.verify();
    });

    it('所有者の取引でなければ、Forbiddenエラーが投げられるはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' }
        };
        const transaction = {
            id: 'transactionId',
            agent: { id: 'anotherAgentId' },
            seller: seller
        };
        const authorizeObject = {};

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('findSeatReservationByTransactionId').never();
        sandbox.mock(authorizeActionRepo).expects('startMvtk').never();
        sandbox.mock(authorizeActionRepo).expects('completeMvtk').never();

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeMvtk(
            agent.id,
            transaction.id,
            <any>authorizeObject
        )(authorizeActionRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});

describe('cancelMvtkAuth()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('アクションが存在すれば、キャンセルできるはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' }
        };
        const action = {
            id: 'actionId'
        };
        const transaction = {
            id: 'transactionId',
            agent: agent,
            seller: seller
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('cancelMvtk').once().withExactArgs(action.id, transaction.id).resolves();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelMvtkAuth(
            agent.id,
            transaction.id,
            action.id
        )(authorizeActionRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('所有者の取引でなければ、Forbiddenエラーが投げられるはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' }
        };
        const action = {
            id: 'actionId'
        };
        const transaction = {
            id: 'transactionId',
            agent: { id: 'anotherAgentId' },
            seller: seller
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('cancelMvtk').never();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelMvtkAuth(
            agent.id,
            transaction.id,
            action.id
        )(authorizeActionRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});

describe('setCustomerContact()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('取引が進行中であれば、エラーにならないはず', async () => {
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
            seller: seller,
            object: {
            }
        };
        const contact = {
            givenName: 'givenName',
            familyName: 'familyName',
            telephone: '09012345678',
            email: 'john@example.com'
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(transactionRepo).expects('setCustomerContactOnPlaceOrderInProgress').once()
            .withArgs(transaction.id).resolves();

        const result = await sskts.service.transaction.placeOrderInProgress.setCustomerContact(
            agent.id,
            transaction.id,
            <any>contact
        )(transactionRepo);

        assert.equal(typeof result, 'object');
        sandbox.verify();
    });

    it('所有者の取引でなければ、Forbiddenエラーが投げられるはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' }
        };
        const transaction = {
            id: 'transactionId',
            agent: { id: 'anotherAgentId' },
            seller: seller,
            object: {
            }
        };
        const contact = {
            givenName: 'givenName',
            familyName: 'familyName',
            telephone: '09012345678',
            email: 'john@example.com'
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(transactionRepo).expects('setCustomerContactOnPlaceOrderInProgress').never();

        const result = await sskts.service.transaction.placeOrderInProgress.setCustomerContact(
            agent.id,
            transaction.id,
            <any>contact
        )(transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });

    it('電話番号フォーマットが不適切であれば、Argumentエラーが投げられるはず', async () => {
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
            seller: seller,
            object: {
            }
        };
        const contact = {
            givenName: 'givenName',
            familyName: 'familyName',
            telephone: '090123456789',
            email: 'john@example.com'
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').never()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(transactionRepo).expects('setCustomerContactOnPlaceOrderInProgress').never();

        const result = await sskts.service.transaction.placeOrderInProgress.setCustomerContact(
            agent.id,
            transaction.id,
            <any>contact
        )(transactionRepo).catch((err) => err);
        console.error(result);

        assert(result instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });
});

describe('confirm()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('確定条件が整っていれば、確定できるはず', async () => {
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
            seller: seller,
            object: {
                customerContact: {}
            }
        };
        const authorizeActions = [
            {
                id: 'actionId1',
                actionStatus: 'CompletedActionStatus',
                agent: transaction.seller,
                object: {},
                result: {
                    updTmpReserveSeatArgs: {},
                    price: 1234
                },
                endDate: new Date()
            },
            {
                id: 'actionId2',
                actionStatus: 'CompletedActionStatus',
                agent: transaction.agent,
                object: {},
                result: {
                    price: 1234
                },
                endDate: new Date()
            }
        ];
        const order = {
            orderNumber: 'orderNumber',
            acceptedOffers: [
                { itemOffered: { reservedTicket: { ticketToken: 'ticketToken1' } } },
                { itemOffered: { reservedTicket: { ticketToken: 'ticketToken2' } } }
            ],
            customer: {
                name: 'name'
            }
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('findByTransactionId').once()
            .withExactArgs(transaction.id).resolves(authorizeActions);
        sandbox.mock(sskts.factory.order).expects('createFromPlaceOrderTransaction').once().returns(order);
        sandbox.mock(sskts.factory.ownershipInfo).expects('create').exactly(order.acceptedOffers.length).returns([]);
        sandbox.mock(transactionRepo).expects('confirmPlaceOrder').once().withArgs(transaction.id).resolves();

        const result = await sskts.service.transaction.placeOrderInProgress.confirm(
            agent.id,
            transaction.id
        )(authorizeActionRepo, transactionRepo);

        assert.deepEqual(result, order);
        sandbox.verify();
    });

    it('確定条件が整っていなければ、Argumentエラーになるはず', async () => {
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
            seller: seller,
            object: {
                customerContact: {}
            }
        };
        const authorizeActions = [
            {
                id: 'actionId1',
                actionStatus: 'CompletedActionStatus',
                agent: transaction.seller,
                object: {},
                result: {
                    updTmpReserveSeatArgs: {},
                    price: 1234
                },
                endDate: new Date()
            },
            {
                id: 'actionId2',
                actionStatus: 'CompletedActionStatus',
                agent: transaction.agent,
                object: {},
                result: {
                    price: 1235
                },
                endDate: new Date()
            }
        ];

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('findByTransactionId').once()
            .withExactArgs(transaction.id).resolves(authorizeActions);
        sandbox.mock(sskts.factory.order).expects('createFromPlaceOrderTransaction').never();
        sandbox.mock(sskts.factory.ownershipInfo).expects('create').never();
        sandbox.mock(transactionRepo).expects('confirmPlaceOrder').never();

        const result = await sskts.service.transaction.placeOrderInProgress.confirm(
            agent.id,
            transaction.id
        )(authorizeActionRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });

    it('所有者の取引でなければ、Forbiddenエラーが投げられるはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' }
        };
        const transaction = {
            id: 'transactionId',
            agent: { id: 'anotherAgentId' },
            seller: seller,
            object: {
            }
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('findByTransactionId').never();
        sandbox.mock(sskts.factory.order).expects('createFromPlaceOrderTransaction').never();
        sandbox.mock(sskts.factory.ownershipInfo).expects('create').never();
        sandbox.mock(transactionRepo).expects('confirmPlaceOrder').never();

        const result = await sskts.service.transaction.placeOrderInProgress.confirm(
            agent.id,
            transaction.id
        )(authorizeActionRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});
