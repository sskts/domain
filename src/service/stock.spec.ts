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
            customerContact: {},
            authorizeActions: [
                {
                    id: 'actionId',
                    actionStatus: 'CompletedActionStatus',
                    purpose: {
                        typeOf: 'SeatReservation'
                    },
                    result: {
                        price: 123,
                        acceptedOffers: [
                            {
                                price: 123,
                                itemOffered: {
                                    reservedTicket: {}
                                }
                            }
                        ],
                        updTmpReserveSeatArgs: {},
                        updTmpReserveSeatResult: {}
                    }
                }
            ]
        },
        result: {
            order: {
                acceptedOffers: []
            },
            ownershipInfos: [{}, {}]
        }
    };
});

describe('unauthorizeSeatReservation()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('取引に座席予約が存在すれば、仮予約解除が実行されるはず', async () => {
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withArgs(existingTransaction.id).returns(Promise.resolve(existingTransaction));
        sandbox.mock(sskts.COA.services.reserve).expects('delTmpReserve').once().returns(Promise.resolve());

        const result = await sskts.service.stock.unauthorizeSeatReservation(existingTransaction.id)(transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('取引に座席予約が存在しなければ、未実装エラーが投げられるはず', async () => {
        const transaction = {
            id: '123',
            object: {
                authorizeActions: []
            }
        };
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(sskts.COA.services.reserve).expects('delTmpReserve').never();

        const result = await sskts.service.stock.unauthorizeSeatReservation(transaction.id)(transactionRepo)
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotImplemented);
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
            .withArgs(existingTransaction.id).returns(Promise.resolve(existingTransaction));
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').once().returns(Promise.resolve(null));
        sandbox.mock(sskts.COA.services.reserve).expects('updReserve').once().returns(Promise.resolve());

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
            .withArgs(transaction.id).returns(Promise.resolve(transaction));
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
                        purpose: {
                            typeOf: 'SeatReservation'
                        },
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
            .withArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updReserve').never();

        const transferSeatReservationError = await sskts.service.stock.transferSeatReservation(
            transaction.id
        )(transactionRepo).catch((err) => err);

        assert(transferSeatReservationError instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });
});
