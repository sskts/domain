/**
 * placeOrderInProgress transaction service test
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../../../../../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('action.authorize.seatReservation.create()', () => {
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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
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

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once()
            .withArgs(transaction.seller, transaction.agent).resolves(action);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().resolves(reserveSeatsTemporarilyResult);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').once().withArgs(action.id).resolves(action);

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo);

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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
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

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once()
            .withArgs(transaction.seller, transaction.agent).resolves(action);
        sandbox.mock(sskts.COA.services.master).expects('mvtkTicketcode').once().resolves(mvtkTicket);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().resolves(reserveSeatsTemporarilyResult);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').once().withArgs(action.id).resolves(action);

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo);

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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
            coaInfo: {
                theaterCode: 'theaterCode'
            }
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

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once()
            .withArgs(transaction.seller, transaction.agent).resolves(action);
        // 会員と非会員で2回呼ばれるはず
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').twice().resolves(salesTickets);
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().resolves(reserveSeatsTemporarilyResult);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').once().withArgs(action.id).resolves(action);

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo);

        assert.deepEqual(result, action);
        sandbox.verify();
    });

    it('ムビチケ情報をCOA券種に変換できなければ、NotFoundErrorになるはず', async () => {
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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
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
        const mvtkTicketResult = {
            name: 'COAServiceError',
            code: 200
        };

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        // ムビチケを券種に変換で失敗する場合
        sandbox.mock(sskts.COA.services.master).expects('mvtkTicketcode').once().rejects(mvtkTicketResult);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').never();
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('ムビチケ情報のCOA券種への変換でサーバーエラーであれば、そのままのエラーになるはず', async () => {
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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
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
        const mvtkTicketResult = new Error('mvtkTicketResult');

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        // ムビチケを券種に変換でサーバーエラーの場合
        sandbox.mock(sskts.COA.services.master).expects('mvtkTicketcode').once().rejects(mvtkTicketResult);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').never();
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);
        assert.deepEqual(result, mvtkTicketResult);
        sandbox.verify();
    });

    it('券種情報の券種コードと券種情報から変換した券種コードが一致しなければ、NotFoundErrorになるはず(ムビチケの場合)', async () => {
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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
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

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        sandbox.mock(sskts.COA.services.master).expects('mvtkTicketcode').once().resolves(mvtkTicket);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').never();
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);
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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
            coaInfo: {
                theaterCode: 'theaterCode'
            }
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

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').never();
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);
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
        const eventIdentifier = 'eventIdentifier';
        const offers = [{
            seatSection: 'seatSection',
            seatNumber: 'seatNumber',
            ticketInfo: {
                salePrice: 123,
                mvtkSalesPrice: 123
            }
        }];

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').never();
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);

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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
            coaInfo: {
                theaterCode: 'theaterCode'
            }
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

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once().resolves(action);
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().rejects();
        // giveUpが呼ばれて、completeは呼ばれないはず
        sandbox.mock(authorizeActionRepo).expects('giveUp').once().withArgs(action.id).resolves(action);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);
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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
            coaInfo: {
                theaterCode: 'theaterCode'
            }
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

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once().resolves(action);
        // COAが座席取得失敗エラーを返してきた場合
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().rejects(new Error('座席取得失敗'));
        // giveUpが呼ばれて、completeは呼ばれないはず
        sandbox.mock(authorizeActionRepo).expects('giveUp').once().withArgs(action.id).resolves(action);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);
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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
            coaInfo: {
                theaterCode: 'theaterCode'
            }
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

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once().resolves(action);
        // COAが座席取得失敗エラーを返してきた場合
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().rejects(updTmpReserveSeatResult);
        // giveUpが呼ばれて、completeは呼ばれないはず
        sandbox.mock(authorizeActionRepo).expects('giveUp').once().withArgs(action.id).resolves(action);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);
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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
            coaInfo: {
                theaterCode: 'theaterCode'
            }
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

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once().resolves(action);
        // COAが座席取得失敗エラーを返してきた場合
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().rejects(updTmpReserveSeatResult);
        // giveUpが呼ばれて、completeは呼ばれないはず
        sandbox.mock(authorizeActionRepo).expects('giveUp').once().withArgs(action.id).resolves(action);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.ServiceUnavailable);
        sandbox.verify();
    });

    it('制限単位がn人単位の券種が指定された場合、割引条件を満たしていなければ、Argumentエラー配列が投げられるはず', async () => {
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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
            coaInfo: {
                theaterCode: 'theaterCode'
            }
        };
        const offers = [
            {
                seatSection: 'seatSection',
                seatNumber: 'seatNumber1',
                ticketInfo: {
                    ticketCode: 'ticketCode',
                    salePrice: 123
                }
            },
            {
                seatSection: 'seatSection',
                seatNumber: 'seatNumber2',
                ticketInfo: {
                    ticketCode: 'ticketCode',
                    salePrice: 123
                }
            },
            {
                seatSection: 'seatSection',
                seatNumber: 'seatNumber3',
                ticketInfo: {
                    ticketCode: 'ticketCode2',
                    salePrice: 123
                }
            },
            {
                seatSection: 'seatSection',
                seatNumber: 'seatNumber4',
                ticketInfo: {
                    ticketCode: 'ticketCode',
                    salePrice: 123
                }
            }
        ];
        const salesTickets = [{
            ticketCode: 'ticketCode',
            limitUnit: '001',
            limitCount: 2 // 2枚単位の制限
        }];

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').never();
        sandbox.mock(authorizeActionRepo).expects('giveUp').never();
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);
        assert(Array.isArray(result));
        assert(result[0] instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });

    it('制限単位がn人単位の券種が指定された場合、割引条件を満たしていれば、承認アクションを取得できるはず', async () => {
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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
            coaInfo: {
                theaterCode: 'theaterCode'
            }
        };
        const offers = [
            {
                seatSection: 'seatSection',
                seatNumber: 'seatNumber1',
                ticketInfo: {
                    ticketCode: 'ticketCode',
                    salePrice: 123
                }
            },
            {
                seatSection: 'seatSection',
                seatNumber: 'seatNumber2',
                ticketInfo: {
                    ticketCode: 'ticketCode',
                    salePrice: 123
                }
            },
            {
                seatSection: 'seatSection',
                seatNumber: 'seatNumber4',
                ticketInfo: {
                    ticketCode: 'ticketCode2',
                    salePrice: 123
                }
            }
        ];
        const salesTickets = [
            {
                ticketCode: 'ticketCode',
                limitUnit: '001',
                limitCount: 2 // 2枚単位の制限
            },
            {
                ticketCode: 'ticketCode2'
            }
        ];
        const updTmpReserveSeatResult = {};
        const action = {
            id: 'actionId'
        };

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once().resolves(action);
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once().resolves(updTmpReserveSeatResult);
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').once().resolves(action);

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.create(
            agent.id,
            transaction.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo);
        assert.deepEqual(result, action);
        sandbox.verify();
    });
});

describe('action.authorize.seatReservation.cancel()', () => {
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

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.cancel(
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

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.cancel(
            agent.id,
            transaction.id,
            actionId
        )(authorizeActionRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});

describe('action.authorize.seatReservation.changeOffers()', () => {
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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
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
        const action = {
            id: 'actionId',
            actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
            object: {
                individualScreeningEvent: event,
                offers: offers
            },
            result: {}
        };

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').once()
            .withExactArgs(eventIdentifier).resolves(event);
        sandbox.mock(authorizeActionRepo).expects('findSeatReservationById').once().withArgs(action.id).resolves(action);
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').once().resolves(salesTickets);
        sandbox.mock(authorizeActionRepo).expects('updateSeatReservation').once().withArgs(action.id).resolves(action);

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.changeOffers(
            agent.id,
            transaction.id,
            action.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo);

        assert.deepEqual(result, action);
        sandbox.verify();
    });

    it('取引主体が一致しなければ、Forbiddenエラーになるはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' }
        };
        const transaction = {
            id: 'transactionId',
            agent: { id: 'invalidAgentId' },
            seller: seller
        };
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
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
        const action = {
            id: 'actionId',
            actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
            object: {
                individualScreeningEvent: event,
                offers: offers
            },
            result: {}
        };

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').never();
        sandbox.mock(authorizeActionRepo).expects('findSeatReservationById').never();
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').never();
        sandbox.mock(authorizeActionRepo).expects('updateSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.changeOffers(
            agent.id,
            transaction.id,
            action.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });

    it('アクションが完了ステータスでなければ、NotFoundエラーになるはず', async () => {
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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
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
        const action = {
            id: 'actionId',
            actionStatus: sskts.factory.actionStatusType.ActiveActionStatus,
            object: {
                individualScreeningEvent: event,
                offers: offers
            },
            result: {}
        };

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('findSeatReservationById').once().withArgs(action.id).resolves(action);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').never();
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').never();
        sandbox.mock(authorizeActionRepo).expects('updateSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.changeOffers(
            agent.id,
            transaction.id,
            action.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.NotFound);
        assert.equal((<sskts.factory.errors.NotFound>result).entityName, 'authorizeAction');
        sandbox.verify();
    });

    it('イベント識別子が一致しなければ、Argumentエラーになるはず', async () => {
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
        const eventIdentifier = 'eventIdentifier';
        const offers = [{
            seatSection: 'seatSection',
            seatNumber: 'seatNumber',
            ticketInfo: {
                ticketCode: 'ticketCode',
                salePrice: 123
            }
        }];
        const action = {
            id: 'actionId',
            actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
            object: {
                individualScreeningEvent: {
                    identifier: 'invalidEventIdentifier'
                },
                offers: offers
            },
            result: {}
        };

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('findSeatReservationById').once().withArgs(action.id).resolves(action);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').never();
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').never();
        sandbox.mock(authorizeActionRepo).expects('updateSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.changeOffers(
            agent.id,
            transaction.id,
            action.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.Argument);
        assert.equal((<sskts.factory.errors.Argument>result).argumentName, 'eventIdentifier');
        sandbox.verify();
    });

    it('座席が一致していなければ、Argumentエラーになるはず', async () => {
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
        const eventIdentifier = 'eventIdentifier';
        const event = {
            identifier: eventIdentifier,
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
        const action = {
            id: 'actionId',
            actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
            object: {
                individualScreeningEvent: event,
                offers: [{
                    seatSection: 'seatSection',
                    seatNumber: 'invalidSeatNumber'
                }]
            },
            result: {}
        };

        const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('findSeatReservationById').once().withArgs(action.id).resolves(action);
        sandbox.mock(eventRepo).expects('findIndividualScreeningEventByIdentifier').never();
        sandbox.mock(sskts.COA.services.reserve).expects('salesTicket').never();
        sandbox.mock(authorizeActionRepo).expects('updateSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.seatReservation.changeOffers(
            agent.id,
            transaction.id,
            action.id,
            eventIdentifier,
            <any>offers
        )(eventRepo, authorizeActionRepo, transactionRepo).catch((err) => err);
        assert(result instanceof sskts.factory.errors.Argument);
        assert.equal((<sskts.factory.errors.Argument>result).argumentName, 'offers');
        sandbox.verify();
    });
});
