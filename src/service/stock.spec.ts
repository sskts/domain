// tslint:disable:no-implicit-dependencies

/**
 * stock service test
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;
let existingTransaction: any;

before(() => {
    sandbox = sinon.sandbox.create();
    existingTransaction = {
        id: '123',
        object: {
            customerContact: {
                telephone: '+819012345678'
            },
            authorizeActions: [
                {
                    id: 'actionId',
                    actionStatus: 'CompletedActionStatus',
                    object: { typeOf: 'SeatReservation' },
                    purpose: {},
                    result: {
                        price: 123,
                        acceptedOffers: [
                            {
                                price: 123,
                                itemOffered: {
                                    reservedTicket: {}
                                }
                            },
                            {
                                price: 456,
                                itemOffered: {
                                    reservedTicket: {}
                                }
                            }
                        ],
                        updTmpReserveSeatArgs: {
                            theaterCode: '123'
                        },
                        updTmpReserveSeatResult: {
                            tmpReserveNum: 123
                        }
                    }
                }
            ]
        },
        result: {
            order: {
                acceptedOffers: [
                    {
                        price: 123,
                        itemOffered: {
                            reservedTicket: {}
                        }
                    },
                    {
                        price: 456,
                        itemOffered: {
                            reservedTicket: {}
                        }
                    }
                ],
                price: 123
            },
            ownershipInfos: [{}, {}]
        }
    };
});

describe('cancelSeatReservationAuth()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('取引に座席予約が存在すれば、仮予約解除が実行されるはず', async () => {
        const authorizeActions = [
            {
                id: 'actionId',
                actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                object: { typeOf: 'SeatReservation' },
                purpose: {},
                result: {
                    updTmpReserveSeatArgs: {},
                    updTmpReserveSeatResult: {}
                }
            }
        ];
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);

        sandbox.mock(actionRepo).expects('findAuthorizeByTransactionId').once()
            .withExactArgs(existingTransaction.id).resolves(authorizeActions);
        sandbox.mock(sskts.COA.services.reserve).expects('delTmpReserve').once().resolves();

        const result = await sskts.service.stock.cancelSeatReservationAuth(existingTransaction.id)(actionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('transferSeatReservation()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('COA未本予約であれば、本予約が実行されるはず', async () => {
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withArgs(existingTransaction.id).resolves(existingTransaction);
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').once()
            .withExactArgs({
                theaterCode: '123',
                reserveNum: 123,
                telNum: '09012345678' // 電話番号は数字のみで本予約されるはず
            }).resolves(null);
        sandbox.mock(sskts.COA.services.reserve).expects('updReserve').once()
            // 予約金額はOrderのpriceのはず
            .withArgs(sinon.match({ reserveAmount: existingTransaction.result.order.price }))
            .resolves();

        const result = await sskts.service.stock.transferSeatReservation(
            existingTransaction.id
        )(transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('取引に座席予約が存在しなければ、本予約は実行されないはず', async () => {
        const transaction = {
            id: '123',
            object: {
                authorizeActions: []
            }
        };
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withArgs(transaction.id).resolves(transaction);
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updReserve').never();

        const result = await sskts.service.stock.transferSeatReservation(
            transaction.id
        )(transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotImplemented);
        sandbox.verify();
    });

    it('座席予約があるにも関わらず購入者情報がなければ、エラーになるはず', async () => {
        const transaction = {
            id: '123',
            object: {
                authorizeActions: [
                    {
                        id: 'actionId',
                        actionStatus: 'CompletedActionStatus',
                        object: { typeOf: 'SeatReservation' },
                        purpose: {},
                        result: {
                            updTmpReserveSeatArgs: {},
                            updTmpReserveSeatResult: {}
                        }
                    }
                ]
            },
            result: {
                order: {
                    acceptedOffers: []
                }
            }
        };
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withArgs(transaction.id).resolves(transaction);
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updReserve').never();

        const transferSeatReservationError = await sskts.service.stock.transferSeatReservation(
            transaction.id
        )(transactionRepo).catch((err) => err);

        assert(transferSeatReservationError instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });
});
