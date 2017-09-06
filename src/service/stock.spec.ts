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
            seatReservation: {
                object: {
                    updTmpReserveSeatArgs: {},
                    acceptedOffers: [
                        {
                            price: 123,
                            itemOffered: {
                                reservedTicket: {}
                            }
                        }
                    ]
                },
                result: {
                    updTmpReserveSeatResult: {}
                }
            }
        },
        result: {
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

    it('取引に座席予約が存在しなければ、仮予約解除は実行されないはず', async () => {
        const transaction = {
            id: '123',
            object: {}
        };
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(sskts.COA.services.reserve).expects('delTmpReserve').never();

        const result = await sskts.service.stock.unauthorizeSeatReservation(transaction.id)(transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('transferSeatReservation()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('COA未本予約であれば、本予約が実行されるはず', async () => {
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withArgs(existingTransaction.id).returns(Promise.resolve(existingTransaction));
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').once().returns(Promise.resolve(null));
        sandbox.mock(sskts.COA.services.reserve).expects('updReserve').once().returns(Promise.resolve());
        sandbox.mock(ownershipInfoRepo).expects('save').exactly(existingTransaction.result.ownershipInfos.length)
            .returns(Promise.resolve());

        const result = await sskts.service.stock.transferSeatReservation(
            existingTransaction.id
        )(ownershipInfoRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('取引に座席予約が存在しなければ、本予約は実行されないはず', async () => {
        const transaction = {
            id: '123',
            object: {}
        };
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updReserve').never();

        const result = await sskts.service.stock.transferSeatReservation(
            transaction.id
        )(ownershipInfoRepo, transactionRepo);

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('座席予約があるにも関わらず購入者情報がなければ、エラーになるはず', async () => {
        const transaction = {
            id: '123',
            object: {
                seatReservation: {}
            }
        };
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderById').once()
            .withArgs(transaction.id).returns(Promise.resolve(transaction));
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').never();
        sandbox.mock(sskts.COA.services.reserve).expects('updReserve').never();

        const transferSeatReservationError = await sskts.service.stock.transferSeatReservation(
            transaction.id
        )(ownershipInfoRepo, transactionRepo).catch((err) => err);
        console.error(transferSeatReservationError);

        assert(transferSeatReservationError instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });
});
