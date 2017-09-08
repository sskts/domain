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

        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(organizationRepo).expects('findMovieTheaterById').never();
        sandbox.mock(sskts.GMO.services.credit).expects('entryTran').never();
        sandbox.mock(sskts.GMO.services.credit).expects('execTran').never();
        sandbox.mock(transactionRepo).expects('pushPaymentInfo').never();

        const result = await sskts.service.transaction.placeOrderInProgress.createCreditCardAuthorization(
            agent.id,
            transaction.id,
            orderId,
            amount,
            sskts.GMO.utils.util.Method.Lump,
            creditCard
        )(organizationRepo, transactionRepo)
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});

describe('cancelGMOAuthorization()', () => {
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

    it('アクションが存在しなければ、NotFoundエラーが投げられるはず', async () => {
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
                paymentInfos: []
            }
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').never();
        sandbox.mock(transactionRepo).expects('pullPaymentInfo').never();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelGMOAuthorization(
            agent.id,
            transaction.id,
            actionId
        )(transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('アクションが存在しなければ、NotFoundエラーが投げられるはず', async () => {
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
                    id: 'anotherActionId',
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
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').never();
        sandbox.mock(transactionRepo).expects('pullPaymentInfo').never();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelGMOAuthorization(
            agent.id,
            transaction.id,
            actionId
        )(transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
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
        sandbox.mock(sskts.GMO.services.credit).expects('alterTran').never();
        sandbox.mock(transactionRepo).expects('pullPaymentInfo').never();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelGMOAuthorization(
            agent.id,
            transaction.id,
            actionId
        )(transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
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
            seatNumber: 'seatNumber'
        }];

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(sskts.COA.services.reserve).expects('updTmpReserveSeat').never();
        sandbox.mock(sskts.factory.action.authorize.seatReservation).expects('createFromCOATmpReserve').never();
        sandbox.mock(transactionRepo).expects('addSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.createSeatReservationAuthorization(
            agent.id,
            transaction.id,
            <any>individualScreeningEvent,
            <any>offers
        )(transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});

describe('cancelSeatReservationAuthorization()', () => {
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

    it('アクションが存在しなければ、NotFoundエラーが投げられるはず', async () => {
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
                    id: 'anotherActionId',
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
        sandbox.mock(sskts.COA.services.reserve).expects('delTmpReserve').never();
        sandbox.mock(transactionRepo).expects('removeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelSeatReservationAuthorization(
            agent.id,
            transaction.id,
            actionId
        )(transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('アクションが存在しなければ、NotFoundエラーが投げられるはず', async () => {
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
            }
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(sskts.COA.services.reserve).expects('delTmpReserve').never();
        sandbox.mock(transactionRepo).expects('removeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelSeatReservationAuthorization(
            agent.id,
            transaction.id,
            actionId
        )(transactionRepo).catch((err) => err);

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
        const actionId = 'actionId';
        const transaction = {
            id: 'transactionId',
            agent: {
                id: 'anotherAgentId'
            },
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
        sandbox.mock(sskts.COA.services.reserve).expects('delTmpReserve').never();
        sandbox.mock(transactionRepo).expects('removeSeatReservation').never();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelSeatReservationAuthorization(
            agent.id,
            transaction.id,
            actionId
        )(transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});

describe('createMvtkAuthorization()', () => {
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
            seller: seller,
            object: {
                seatReservation: {
                    object: {
                        acceptedOffers: [],
                        updTmpReserveSeatArgs: {
                            theaterCode: '118',
                            titleCode: '12345',
                            titleBranchNum: '0',
                            screenCode: '01'
                        }
                    },
                    result: {
                        updTmpReserveSeatResult: {
                            listTmpReserve: []
                        }
                    }
                }
            }
        };
        const authorizeObject = {
            seatInfoSyncIn: {
                stCd: '18',
                skhnCd: '123450',
                screnCd: '01',
                knyknrNoInfo: [],
                zskInfo: []
            }
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(transactionRepo).expects('pushDiscountInfo').once()
            .withArgs(transaction.id).returns(Promise.resolve());

        const result = await sskts.service.transaction.placeOrderInProgress.createMvtkAuthorization(
            agent.id,
            transaction.id,
            <any>authorizeObject
        )(transactionRepo);

        assert.notEqual(result, undefined);
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
                seatReservation: {
                    object: {
                        acceptedOffers: [],
                        updTmpReserveSeatArgs: {
                            theaterCode: '118',
                            titleCode: '12345',
                            titleBranchNum: '0',
                            screenCode: '01'
                        }
                    },
                    result: {
                        updTmpReserveSeatResult: {
                            listTmpReserve: []
                        }
                    }
                }
            }
        };
        const authorizeObject = {
            seatInfoSyncIn: {
                stCd: '18',
                skhnCd: '123450',
                screnCd: '01',
                knyknrNoInfo: [],
                zskInfo: []
            }
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(transactionRepo).expects('pushDiscountInfo').never();

        const result = await sskts.service.transaction.placeOrderInProgress.createMvtkAuthorization(
            agent.id,
            transaction.id,
            <any>authorizeObject
        )(transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});

describe('cancelMvtkAuthorization()', () => {
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
        const actionId = 'actionId';
        const transaction = {
            id: 'transactionId',
            agent: agent,
            seller: seller,
            object: {
                discountInfos: [{
                    id: actionId,
                    purpose: {
                        typeOf: sskts.factory.action.authorize.authorizeActionPurpose.Mvtk
                    },
                    object: {
                    }
                }]
            }
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(transactionRepo).expects('pullDiscountInfo').once()
            .withExactArgs(transaction.id, actionId).returns(Promise.resolve());

        const result = await sskts.service.transaction.placeOrderInProgress.cancelMvtkAuthorization(
            agent.id,
            transaction.id,
            actionId
        )(transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('アクションが存在しなければ、NotFoundエラーが投げられるはず', async () => {
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
                discountInfos: [{
                    id: 'anotherActionId',
                    purpose: {
                        typeOf: sskts.factory.action.authorize.authorizeActionPurpose.Mvtk
                    },
                    object: {
                    }
                }]
            }
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(transactionRepo).expects('pullDiscountInfo').never();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelMvtkAuthorization(
            agent.id,
            transaction.id,
            actionId
        )(transactionRepo).catch((err) => err);

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
        const actionId = 'actionId';
        const transaction = {
            id: 'transactionId',
            agent: { id: 'anotherAgentId' },
            seller: seller,
            object: {
                discountInfos: [{
                    id: actionId,
                    purpose: {
                        typeOf: sskts.factory.action.authorize.authorizeActionPurpose.Mvtk
                    },
                    object: {
                    }
                }]
            }
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(transactionRepo).expects('pullDiscountInfo').never();

        const result = await sskts.service.transaction.placeOrderInProgress.cancelMvtkAuthorization(
            agent.id,
            transaction.id,
            actionId
        )(transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});

describe('setCustomerContacts()', () => {
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
        const contact = {};

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(transactionRepo).expects('setCustomerContactsOnPlaceOrderInProgress').once()
            .withExactArgs(transaction.id, contact).returns(Promise.resolve());

        const result = await sskts.service.transaction.placeOrderInProgress.setCustomerContacts(
            agent.id,
            transaction.id,
            <any>contact
        )(transactionRepo);

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
        const transaction = {
            id: 'transactionId',
            agent: { id: 'anotherAgentId' },
            seller: seller,
            object: {
            }
        };
        const contact = {};

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(transactionRepo).expects('setCustomerContactsOnPlaceOrderInProgress').never();

        const result = await sskts.service.transaction.placeOrderInProgress.setCustomerContacts(
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
                seatReservation: {
                    object: {
                        updTmpReserveSeatArgs: {}
                    },
                    result: {
                        price: 1234
                    }
                },
                paymentInfos: [{
                    result: {
                        price: 1234
                    }
                }],
                discountInfos: [],
                customerContact: {}
            }
        };
        const order = {
            orderNumber: 'orderNumber',
            acceptedOffers: [{}, {}],
            customer: {
                name: 'name'
            }
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(sskts.factory.order).expects('createFromPlaceOrderTransaction').once()
            .withExactArgs({ transaction: transaction }).returns(order);
        sandbox.mock(sskts.factory.ownershipInfo).expects('create').exactly(order.acceptedOffers.length)
            .returns([]);
        sandbox.mock(transactionRepo).expects('confirmPlaceOrder').once()
            .withArgs(transaction.id).returns(Promise.resolve());

        const result = await sskts.service.transaction.placeOrderInProgress.confirm(
            agent.id,
            transaction.id
        )(transactionRepo);

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

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(sskts.factory.order).expects('createFromPlaceOrderTransaction').never();
        sandbox.mock(sskts.factory.ownershipInfo).expects('create').never();
        sandbox.mock(transactionRepo).expects('confirmPlaceOrder').never();

        const result = await sskts.service.transaction.placeOrderInProgress.confirm(
            agent.id,
            transaction.id
        )(transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});
