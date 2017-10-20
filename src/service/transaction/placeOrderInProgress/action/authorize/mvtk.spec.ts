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

describe('action.authorize.mvtk.create()', () => {
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
        const seatReservationAuthorizeActions = [{
            id: 'actionId',
            actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
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
        }];
        const action = {
            id: 'actionId'
        };

        const mvtkAuthorizeActionRepo = new sskts.repository.action.authorize.Mvtk(sskts.mongoose.connection);
        const seatReservationAuthorizeActionRepo = new sskts.repository.action.authorize.SeatReservation(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(seatReservationAuthorizeActionRepo).expects('findByTransactionId').once()
            .withExactArgs(transaction.id).resolves(seatReservationAuthorizeActions);
        sandbox.mock(mvtkAuthorizeActionRepo).expects('start').once()
            .withArgs(transaction.agent, transaction.seller).resolves(action);
        sandbox.mock(mvtkAuthorizeActionRepo).expects('complete').once().withArgs(action.id).resolves(action);

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.mvtk.create(
            agent.id,
            transaction.id,
            <any>authorizeObject
        )(seatReservationAuthorizeActionRepo, mvtkAuthorizeActionRepo, transactionRepo);

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

        const mvtkAuthorizeActionRepo = new sskts.repository.action.authorize.Mvtk(sskts.mongoose.connection);
        const seatReservationAuthorizeActionRepo = new sskts.repository.action.authorize.SeatReservation(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(seatReservationAuthorizeActionRepo).expects('findByTransactionId').never();
        sandbox.mock(mvtkAuthorizeActionRepo).expects('start').never();
        sandbox.mock(mvtkAuthorizeActionRepo).expects('complete').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.mvtk.create(
            agent.id,
            transaction.id,
            <any>authorizeObject
        )(seatReservationAuthorizeActionRepo, mvtkAuthorizeActionRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});

describe('action.authorize.mvtk.cancel()', () => {
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

        const authorizeActionRepo = new sskts.repository.action.authorize.Mvtk(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('cancel').once().withExactArgs(action.id, transaction.id).resolves();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.mvtk.cancel(
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

        const authorizeActionRepo = new sskts.repository.action.authorize.Mvtk(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findPlaceOrderInProgressById').once()
            .withExactArgs(transaction.id).resolves(transaction);
        sandbox.mock(authorizeActionRepo).expects('cancel').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.mvtk.cancel(
            agent.id,
            transaction.id,
            action.id
        )(authorizeActionRepo, transactionRepo).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});
