// tslint:disable:no-implicit-dependencies
/**
 * stock service test
 */
import * as mongoose from 'mongoose';
import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;
let existingTransaction: any;

before(() => {
    sandbox = sinon.createSandbox();
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
                    object: { typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation },
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
                        requestBody: {
                            theaterCode: '123'
                        },
                        responseBody: {
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
                object: { typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation },
                purpose: {},
                result: {
                    requestBody: {},
                    responseBody: {}
                }
            }
        ];
        const actionRepo = new sskts.repository.Action(mongoose.connection);

        sandbox.mock(actionRepo).expects('searchByPurpose').once()
            .resolves(authorizeActions);
        sandbox.mock(sskts.COA.services.reserve).expects('delTmpReserve').once().resolves();

        const result = await sskts.service.stock.cancelSeatReservationAuth(existingTransaction.id)({ action: actionRepo });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
