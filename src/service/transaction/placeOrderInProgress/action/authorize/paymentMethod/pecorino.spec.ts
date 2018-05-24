// tslint:disable:no-implicit-dependencies

/**
 * Pecorino承認アクションテスト
 * @ignore
 */

import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../../../../../../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('action.authorize.pecorino.create()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('口座サービスを正常であればエラーにならないはず', async () => {
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
        const amount = 1234;
        const action = {
            id: 'actionId',
            agent: agent,
            recipient: seller
        };
        const pecorinoTransaction = { typeOf: sskts.factory.pecorino.transactionType.Transfer, id: 'transactionId' };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const payTransactionService = new sskts.pecorinoapi.service.transaction.Pay(<any>{});

        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(actionRepo).expects('start').once().resolves(action);
        sandbox.mock(actionRepo).expects('complete').once().resolves(action);
        sandbox.mock(payTransactionService).expects('start').once().resolves(pecorinoTransaction);

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.paymentMethod.pecorino.create({
            transactionId: transaction.id,
            amount: amount,
            fromAccountNumber: 'fromAccountNumber',
            notes: 'notes'
        })({
            action: actionRepo,
            organization: organizationRepo,
            transaction: transactionRepo,
            payTransactionService: payTransactionService
        });

        assert.deepEqual(result, action);
        sandbox.verify();
    });

    // it('所有者の取引でなければ、Forbiddenエラーが投げられるはず', async () => {
    //     const agent = {
    //         id: 'agentId'
    //     };
    //     const seller = {
    //         id: 'sellerId',
    //         name: { ja: 'ja', en: 'ne' },
    //         gmoInfo: {
    //             shopId: 'shopId',
    //             shopPass: 'shopPass'
    //         }
    //     };
    //     const transaction = {
    //         id: 'transactionId',
    //         agent: {
    //             id: 'anotherAgentId'
    //         },
    //         seller: seller
    //     };
    //     const price = 1234;

    //     const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
    //     const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
    //     const payTransactionService = new sskts.pecorinoapi.service.transaction.Pay(<any>{});

    //     sandbox.mock(transactionRepo).expects('findInProgressById').once().withExactArgs(transaction.id).resolves(transaction);
    //     sandbox.mock(actionRepo).expects('start').never();
    //     sandbox.mock(payTransactionService).expects('start').never();

    //     const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.paymentMethod.pecorino.create(
    //         agent.id,
    //         transaction.id,
    //         price
    //     )({
    //         action: actionRepo,
    //         transaction: transactionRepo,
    //         payTransactionService: payTransactionService
    //     }).catch((err) => err);

    //     assert(result instanceof sskts.factory.errors.Forbidden);
    //     sandbox.verify();
    // });

    it('口座サービスでエラーが発生すればアクションにエラー結果が追加されるはず', async () => {
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
        const amount = 1234;
        const action = {
            typeOf: sskts.factory.actionType.AuthorizeAction,
            id: 'actionId',
            agent: agent,
            recipient: seller
        };
        const startPayTransactionResult = new Error('startPayTransactionError');

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const payTransactionService = new sskts.pecorinoapi.service.transaction.Pay(<any>{});

        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(actionRepo).expects('start').once().resolves(action);
        sandbox.mock(payTransactionService).expects('start').once().rejects(startPayTransactionResult);
        sandbox.mock(actionRepo).expects('giveUp').once()
            .withArgs(action.typeOf, action.id, sinon.match({ message: startPayTransactionResult.message })).resolves(action);
        sandbox.mock(actionRepo).expects('complete').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.paymentMethod.pecorino.create({
            transactionId: transaction.id,
            amount: amount,
            fromAccountNumber: 'fromAccountNumber',
            notes: 'notes'
        })({
            action: actionRepo,
            organization: organizationRepo,
            transaction: transactionRepo,
            payTransactionService: payTransactionService
        }).catch((err) => err);

        assert(result instanceof Error);
        sandbox.verify();
    });
});

// describe('action.authorize.creditCard.cancel()', () => {
//     afterEach(() => {
//         sandbox.restore();
//     });

//     it('アクションが存在すれば、キャンセルできるはず', async () => {
//         const agent = {
//             id: 'agentId'
//         };
//         const seller = {
//             id: 'sellerId',
//             name: { ja: 'ja', en: 'ne' },
//             gmoInfo: {
//                 shopId: 'shopId',
//                 shopPass: 'shopPass'
//             }
//         };
//         const action = {
//             typeOf: sskts.factory.actionType.AuthorizeAction,
//             id: 'actionId',
//             result: {
//                 execTranArgs: {},
//                 entryTranArgs: {}
//             }
//         };
//         const transaction = {
//             id: 'transactionId',
//             agent: agent,
//             seller: seller
//         };

//         const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
//         const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

//         sandbox.mock(transactionRepo).expects('findInProgressById').once()
//             .withExactArgs(transaction.id).resolves(transaction);
//         sandbox.mock(actionRepo).expects('cancel').once()
//             .withExactArgs(action.typeOf, action.id).resolves(action);
//         sandbox.mock(sskts.GMO.services.credit).expects('alterTran').once().resolves();

//         const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.creditCard.cancel(
//             agent.id,
//             transaction.id,
//             action.id
//         )(actionRepo, transactionRepo);

//         assert.equal(result, undefined);
//         sandbox.verify();
//     });
// });
