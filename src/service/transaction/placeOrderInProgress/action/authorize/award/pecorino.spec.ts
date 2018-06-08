// tslint:disable:no-implicit-dependencies
/**
 * ポイントインセンティブ承認サービステスト
 */
import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as sskts from '../../../../../../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.createSandbox();
});

describe('ポイントインセンティブ承認を作成する', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('Pecorinoサービスが正常であればアクションを完了できるはず', async () => {
        const transaction = {
            agent: { memberOf: {} },
            seller: { name: {} }
        };
        const ownershipInfo = {
            typeOfGood: {
                award: [sskts.factory.programMembership.Award.PecorinoPayment]
            }
        };
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const depositService = new sskts.pecorinoapi.service.transaction.Deposit(<any>{});
        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(ownershipInfoRepo).expects('search').once().resolves([ownershipInfo]);
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(depositService).expects('start').once().resolves({});
        sandbox.mock(actionRepo).expects('complete').once().resolves({});

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.award.pecorino.create(<any>{})({
            action: actionRepo,
            transaction: transactionRepo,
            ownershipInfo: ownershipInfoRepo,
            depositTransactionService: depositService
        });
        assert.equal(typeof result, 'object');
        sandbox.verify();
    });
});

describe('ポイントインセンティブ承認を取り消す', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('Pecorinoサービスが正常であれば取消できるはず', async () => {
        const transaction = {
            agent: { memberOf: {} },
            seller: { name: {} }
        };
        const action = { result: { pecorinoTransaction: {} } };
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const depositService = new sskts.pecorinoapi.service.transaction.Deposit(<any>{});
        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(actionRepo).expects('cancel').once().resolves(action);
        sandbox.mock(depositService).expects('cancel').once().resolves();

        const result = await sskts.service.transaction.placeOrderInProgress.action.authorize.award.pecorino.cancel(<any>{})({
            action: actionRepo,
            transaction: transactionRepo,
            depositTransactionService: depositService
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});
