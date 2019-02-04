// tslint:disable:no-implicit-dependencies
/**
 * 注文サービステスト
 */
import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../index';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.createSandbox();
});

describe('cancelReservations()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('アクションを完了できるはず', async () => {
        const order = {
            customer: { telephone: '+819096793896' },
            acceptedOffers: [
                {
                    itemOffered: {
                        reservationNumber: '123',
                        reservationFor: { superEvent: { location: { branchCode: '123' } } }
                    }
                }
            ],
            orderNumber: 'orderNumber'
        };
        const ownershipInfos = [
            { identifier: 'identifier' }
        ];
        const placeOrderTransaction = {
            result: { ownershipInfos }
        };
        const returnOrderTransaction = {
            id: 'id',
            object: { order },
            result: {},
            potentialActions: {
                returnOrder: {
                    typeOf: sskts.factory.actionType.ReturnAction,
                    object: order,
                    potentialActions: {
                        refundCreditCard: [{}],
                        refundAccount: [{}],
                        returnPointAward: [{}]
                    }
                }
            }
        };
        const action = { id: 'actionId', typeOf: returnOrderTransaction.potentialActions.returnOrder.typeOf };
        const stateReserveResult = {};

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo)
            .expects('search')
            .twice()
            .onFirstCall()
            .resolves([returnOrderTransaction])
            .onSecondCall()
            .resolves([placeOrderTransaction]);
        sandbox.mock(actionRepo)
            .expects('start')
            .once()
            .resolves(action);
        sandbox.mock(actionRepo)
            .expects('complete')
            .once()
            .resolves(action);
        sandbox.mock(actionRepo)
            .expects('giveUp')
            .never();
        sandbox.mock(sskts.COA.services.reserve)
            .expects('stateReserve')
            .once()
            .resolves(stateReserveResult);
        sandbox.mock(sskts.COA.services.reserve)
            .expects('delReserve')
            .once()
            .resolves();
        sandbox.mock(ownershipInfoRepo.ownershipInfoModel)
            .expects('findOneAndUpdate')
            .exactly(ownershipInfos.length)
            .chain('exec');
        sandbox.mock(orderRepo)
            .expects('changeStatus')
            .once()
            .resolves();
        sandbox.mock(taskRepo)
            .expects('save')
            // tslint:disable-next-line:no-magic-numbers
            .exactly(3);

        const result = await sskts.service.order.cancelReservations(order)({
            action: actionRepo,
            order: orderRepo,
            ownershipInfo: ownershipInfoRepo,
            transaction: transactionRepo,
            task: taskRepo
        });

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('COA予約内容抽出に失敗すればアクションにエラー結果が追加されるはず', async () => {
        const order = {
            customer: { telephone: '+819096793896' },
            acceptedOffers: [
                {
                    itemOffered: {
                        reservationNumber: '123',
                        reservationFor: { superEvent: { location: { branchCode: '123' } } }
                    }
                }
            ],
            orderNumber: 'orderNumber'
        };
        const ownershipInfos = [
            { identifier: 'identifier' }
        ];
        const placeOrderTransaction = {
            result: { ownershipInfos }
        };
        const returnOrderTransaction = {
            id: 'id',
            object: { order },
            result: {},
            potentialActions: {
                returnOrder: {
                    typeOf: sskts.factory.actionType.ReturnAction,
                    object: order,
                    potentialActions: {
                        refundCreditCard: [{}],
                        refundAccount: [{}],
                        returnPointAward: [{}]
                    }
                }
            }
        };
        const action = { id: 'actionId', typeOf: returnOrderTransaction.potentialActions.returnOrder.typeOf };
        const stateReserveResult = new Error('stateReserveError');

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

        sandbox.mock(transactionRepo)
            .expects('search')
            .twice()
            .onFirstCall()
            .resolves([returnOrderTransaction])
            .onSecondCall()
            .resolves([placeOrderTransaction]);
        sandbox.mock(actionRepo)
            .expects('start')
            .once()
            .resolves(action);
        sandbox.mock(actionRepo)
            .expects('giveUp')
            .once()
            .resolves(action);
        sandbox.mock(sskts.COA.services.reserve)
            .expects('stateReserve')
            .once()
            .rejects(stateReserveResult);

        const result = await sskts.service.order.cancelReservations(order)({
            action: actionRepo,
            order: orderRepo,
            ownershipInfo: ownershipInfoRepo,
            transaction: transactionRepo,
            task: taskRepo
        })
            .catch((err) => err);

        assert.deepEqual(result, stateReserveResult);
        sandbox.verify();
    });
});
