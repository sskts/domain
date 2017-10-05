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
            .returns(Promise.resolve(transaction));

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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(authorizeActionRepo).expects('startCreditCard').once()
            .returns(Promise.resolve(action));
        sandbox.mock(organizationRepo).expects('findMovieTheaterById').once()
            .withExactArgs(seller.id).returns(Promise.resolve(seller));
        sandbox.mock(sskts.GMO.services.credit).expects('entryTran').once()
            .returns(Promise.resolve(entryTranResult));
        sandbox.mock(sskts.GMO.services.credit).expects('execTran').once()
            .returns(Promise.resolve(execTranResult));
        sandbox.mock(authorizeActionRepo).expects('completeCreditCard').once()
            .returns(Promise.resolve(action));

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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
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
});

describe('cancelGMOAuth()', () => {
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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(authorizeActionRepo).expects('cancelCreditCard').once()
            .withExactArgs(action.id, transaction.id).returns(Promise.resolve(action));
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').once()
            .returns(Promise.resolve());

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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
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
});

describe('authorizeSeatReservation()', () => {
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
            seatNumber: 'seatNumber',
            ticketInfo: {
                salePrice: 123,
                mvtkSalesPrice: 123
            }
        }];
        const reserveSeatsTemporarilyResult = <any>{};
        const action = {
            id: 'actionId'
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(authorizeActionRepo).expects('startSeatReservation').once()
            .withArgs(transaction.seller, transaction.agent).returns(Promise.resolve(action));
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').once()
            .returns(Promise.resolve(reserveSeatsTemporarilyResult));
        sandbox.mock(authorizeActionRepo).expects('completeSeatReservation').once()
            .withArgs(action.id).returns(Promise.resolve(action));

        const result = await sskts.service.transaction.placeOrderInProgress.authorizeSeatReservation(
            agent.id,
            transaction.id,
            <any>individualScreeningEvent,
            <any>offers
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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(authorizeActionRepo).expects('cancelSeatReservation').once()
            .withExactArgs(action.id, transaction.id).returns(Promise.resolve(action));
        sandbox.mock(sskts.COA.services.reserve).expects('delTmpReserve').once()
            .returns(Promise.resolve());

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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(authorizeActionRepo).expects('findSeatReservationByTransactionId').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(seatReservationAuthorizeAction));
        sandbox.mock(authorizeActionRepo).expects('startMvtk').once()
            .withArgs(transaction.agent, transaction.seller).returns(Promise.resolve(action));
        sandbox.mock(authorizeActionRepo).expects('completeMvtk').once()
            .withArgs(action.id).returns(Promise.resolve(action));

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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(authorizeActionRepo).expects('cancelMvtk').once()
            .withExactArgs(action.id, transaction.id).returns(Promise.resolve());

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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(transactionRepo).expects('setCustomerContactOnPlaceOrderInProgress').once()
            .withArgs(transaction.id).returns(Promise.resolve());

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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(transactionRepo).expects('setCustomerContactOnPlaceOrderInProgress').never();

        const result = await sskts.service.transaction.placeOrderInProgress.setCustomerContact(
            agent.id,
            transaction.id,
            <any>contact
        )(transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
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
            acceptedOffers: [{ itemOffered: {} }, { itemOffered: {} }],
            customer: {
                name: 'name'
            }
        };

        const authorizeActionRepo = new sskts.repository.action.Authorize(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(authorizeActionRepo).expects('findByTransactionId').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(authorizeActions));
        sandbox.mock(sskts.factory.order).expects('createFromPlaceOrderTransaction').once()
            .returns(order);
        sandbox.mock(sskts.factory.ownershipInfo).expects('create').exactly(order.acceptedOffers.length)
            .returns([]);
        sandbox.mock(transactionRepo).expects('confirmPlaceOrder').once()
            .withArgs(transaction.id).returns(Promise.resolve());

        const result = await sskts.service.transaction.placeOrderInProgress.confirm(
            agent.id,
            transaction.id
        )(authorizeActionRepo, transactionRepo);

        assert.deepEqual(result, order);
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
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
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
