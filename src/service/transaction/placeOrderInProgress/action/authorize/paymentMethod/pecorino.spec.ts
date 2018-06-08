// tslint:disable:no-implicit-dependencies
/**
 * Pecorino決済承認アクションテスト
 * @ignore
 */
import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../../../../../../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.createSandbox();
});

describe('Pecorino決済を承認する', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('口座サービスを正常であればエラーにならないはず', async () => {
        const agent = {
            id: 'agentId',
            memberOf: {}
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            gmoInfo: {
                shopId: 'shopId',
                shopPass: 'shopPass'
            },
            paymentAccepted: [{ paymentMethodType: sskts.factory.paymentMethodType.Pecorino }]
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
        const programMemberships = [{
            typeOfGood: {
                award: [sskts.factory.programMembership.Award.PecorinoPayment]
            }
        }];
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const transferService = new sskts.pecorinoapi.service.transaction.Transfer(<any>{});
        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(ownershipInfoRepo).expects('search').once().resolves(programMemberships);
        sandbox.mock(actionRepo).expects('start').once().resolves(action);
        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(actionRepo).expects('complete').once().resolves(action);
        sandbox.mock(transferService).expects('start').once().resolves(pecorinoTransaction);

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.paymentMethod.pecorino.create({
            transactionId: transaction.id,
            amount: amount,
            fromAccountNumber: 'fromAccountNumber',
            notes: 'notes'
        })({
            action: actionRepo,
            organization: organizationRepo,
            ownershipInfo: ownershipInfoRepo,
            transaction: transactionRepo,
            transferTransactionService: transferService
        });

        assert.deepEqual(result, action);
        sandbox.verify();
    });

    it('会員でなければForbiddenエラーとなるはず', async () => {
        const agent = {
            id: 'agentId'
            // memberOf: {}
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
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const transferService = new sskts.pecorinoapi.service.transaction.Transfer(<any>{});

        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(ownershipInfoRepo).expects('search').never();
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.paymentMethod.pecorino.create({
            transactionId: transaction.id,
            amount: amount,
            fromAccountNumber: 'fromAccountNumber',
            notes: 'notes'
        })({
            action: actionRepo,
            organization: organizationRepo,
            ownershipInfo: ownershipInfoRepo,
            transaction: transactionRepo,
            transferTransactionService: transferService
        }).catch((err) => err);
        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });

    it('必要な会員特典を所有していなければForbiddenエラーとなるはず', async () => {
        const agent = {
            id: 'agentId',
            memberOf: {}
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
        const programMemberships = [{
            typeOfGood: {
                award: []
            }
        }];
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const transferService = new sskts.pecorinoapi.service.transaction.Transfer(<any>{});
        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(ownershipInfoRepo).expects('search').once().resolves(programMemberships);
        sandbox.mock(actionRepo).expects('start').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.paymentMethod.pecorino.create({
            transactionId: transaction.id,
            amount: amount,
            fromAccountNumber: 'fromAccountNumber',
            notes: 'notes'
        })({
            action: actionRepo,
            organization: organizationRepo,
            ownershipInfo: ownershipInfoRepo,
            transaction: transactionRepo,
            transferTransactionService: transferService
        }).catch((err) => err);
        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });

    it('口座サービスでエラーが発生すればアクションにエラー結果が追加されるはず', async () => {
        const agent = {
            id: 'agentId',
            memberOf: {}
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            gmoInfo: {
                shopId: 'shopId',
                shopPass: 'shopPass'
            },
            paymentAccepted: [{ paymentMethodType: sskts.factory.paymentMethodType.Pecorino }]
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
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const transferService = new sskts.pecorinoapi.service.transaction.Transfer(<any>{});
        const programMemberships = [{
            typeOfGood: {
                award: [sskts.factory.programMembership.Award.PecorinoPayment]
            }
        }];
        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(ownershipInfoRepo).expects('search').once().resolves(programMemberships);
        sandbox.mock(actionRepo).expects('start').once().resolves(action);
        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(transferService).expects('start').once().rejects(startPayTransactionResult);
        sandbox.mock(actionRepo).expects('giveUp').once().resolves(action);
        sandbox.mock(actionRepo).expects('complete').never();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.paymentMethod.pecorino.create({
            transactionId: transaction.id,
            amount: amount,
            fromAccountNumber: 'fromAccountNumber',
            notes: 'notes'
        })({
            action: actionRepo,
            organization: organizationRepo,
            ownershipInfo: ownershipInfoRepo,
            transaction: transactionRepo,
            transferTransactionService: transferService
        }).catch((err) => err);

        assert(result instanceof Error);
        sandbox.verify();
    });
});

describe('Pecorino決済承認を取り消す', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('出金取引による承認アクションが存在すれば、キャンセルできるはず', async () => {
        const transaction = {
            id: 'transactionId',
            agent: { id: 'agentId' },
            seller: {}
        };
        const action = {
            result: {
                pecorinoTransaction: {}
            }
        };
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const transferService = new sskts.pecorinoapi.service.transaction.Transfer(<any>{});
        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(actionRepo).expects('cancel').once().resolves(action);
        sandbox.mock(transferService).expects('cancel').once().resolves();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.paymentMethod.pecorino.cancel({
            agentId: transaction.agent.id,
            transactionId: transaction.id,
            actionId: 'actionId'
        })({
            action: actionRepo,
            transaction: transactionRepo,
            transferTransactionService: transferService
        });

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('転送取引による承認アクションが存在すれば、キャンセルできるはず', async () => {
        const transaction = {
            id: 'transactionId',
            agent: { id: 'agentId' },
            seller: {}
        };
        const action = {
            result: {
                pecorinoTransaction: {}
            }
        };
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const transferService = new sskts.pecorinoapi.service.transaction.Transfer(<any>{});
        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(actionRepo).expects('cancel').once().resolves(action);
        sandbox.mock(transferService).expects('cancel').once().resolves();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.paymentMethod.pecorino.cancel({
            agentId: transaction.agent.id,
            transactionId: transaction.id,
            actionId: 'actionId'
        })({
            action: actionRepo,
            transaction: transactionRepo,
            transferTransactionService: transferService
        });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
