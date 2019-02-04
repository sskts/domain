// tslint:disable:no-implicit-dependencies
/**
 * 配送サービステスト
 */
import * as mongoose from 'mongoose';
import * as assert from 'power-assert';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.createSandbox();
});

describe('ポイントインセンティブを適用する', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('Pecorinoサービスが正常であればアクションを完了できるはず', async () => {
        const actionRepo = new sskts.repository.Action(mongoose.connection);
        const pecorinoAuthClient = new sskts.pecorinoapi.auth.ClientCredentials(<any>{});
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(sskts.pecorinoapi.service.transaction.Deposit.prototype).expects('confirm').once().resolves();
        sandbox.mock(actionRepo).expects('complete').once().resolves({});

        const result = await sskts.service.delivery.givePointAward(<any>{
            object: {
                pointAPIEndpoint: 'https://example.com',
                pointTransaction: {}
            }
        })({
            action: actionRepo,
            pecorinoAuthClient: pecorinoAuthClient
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('Pecorinoサービスがエラーを返せばアクションを断念するはず', async () => {
        const pecorinoError = new Error('pecorinoError');
        const actionRepo = new sskts.repository.Action(mongoose.connection);
        const pecorinoAuthClient = new sskts.pecorinoapi.auth.ClientCredentials(<any>{});
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(sskts.pecorinoapi.service.transaction.Deposit.prototype).expects('confirm').once().rejects(pecorinoError);
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(actionRepo).expects('giveUp').once().resolves({});

        const result = await sskts.service.delivery.givePointAward(<any>{
            object: {
                pointAPIEndpoint: 'https://example.com',
                pointTransaction: {}
            }
        })({
            action: actionRepo,
            pecorinoAuthClient: pecorinoAuthClient
        }).catch((err) => err);
        assert.deepEqual(result, pecorinoError);
        sandbox.verify();
    });
});

describe('ポイントインセンティブを返却する', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('Pecorinoサービスが正常であればアクションを完了できるはず', async () => {
        const actionRepo = new sskts.repository.Action(mongoose.connection);
        const pecorinoAuthClient = new sskts.pecorinoapi.auth.ClientCredentials(<any>{});
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(sskts.pecorinoapi.service.transaction.Withdraw.prototype).expects('start').once().resolves({});
        sandbox.mock(sskts.pecorinoapi.service.transaction.Withdraw.prototype).expects('confirm').once().resolves();
        sandbox.mock(actionRepo).expects('complete').once().resolves({});

        const result = await sskts.service.delivery.returnPointAward(<any>{
            object: {
                purpose: {
                    agent: {},
                    seller: { name: {} }
                },
                result: {
                    pecorinoEndpoint: 'https://example.com',
                    pecorinoTransaction: { object: {} }
                }
            }
        })({
            action: actionRepo,
            pecorinoAuthClient: pecorinoAuthClient
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('Pecorinoサービスがエラーを返せばアクションを断念するはず', async () => {
        const pecorinoError = new Error('pecorinoError');
        const actionRepo = new sskts.repository.Action(mongoose.connection);
        const pecorinoAuthClient = new sskts.pecorinoapi.auth.ClientCredentials(<any>{});
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(sskts.pecorinoapi.service.transaction.Withdraw.prototype).expects('start').once().rejects(pecorinoError);
        sandbox.mock(sskts.pecorinoapi.service.transaction.Withdraw.prototype).expects('confirm').never();
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(actionRepo).expects('giveUp').once().resolves({});

        const result = await sskts.service.delivery.returnPointAward(<any>{
            object: {
                purpose: {
                    agent: {},
                    seller: { name: {} }
                },
                result: {
                    pecorinoEndpoint: 'https://example.com',
                    pecorinoTransaction: { object: {} }
                }
            }
        })({
            action: actionRepo,
            pecorinoAuthClient: pecorinoAuthClient
        }).catch((err) => err);
        assert.deepEqual(result, pecorinoError);
        sandbox.verify();
    });
});

describe('ポイントインセンティブ承認取消', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('Pecorinoサービスが正常であればインセンティブをキャンセルできるはず', async () => {
        const authorizeActions = [{
            object: { typeOf: sskts.factory.action.authorize.award.point.ObjectType.PointAward },
            actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
            result: {
                pecorinoEndpoint: 'https://example.com',
                pecorinoTransaction: { object: {} }
            }
        }];
        const actionRepo = new sskts.repository.Action(mongoose.connection);
        const pecorinoAuthClient = new sskts.pecorinoapi.auth.ClientCredentials(<any>{});
        sandbox.mock(actionRepo).expects('searchByPurpose').once().resolves(authorizeActions);
        sandbox.mock(sskts.pecorinoapi.service.transaction.Deposit.prototype).expects('cancel').once().resolves({});

        const result = await sskts.service.delivery.cancelPointAward(<any>{})({
            action: actionRepo,
            pecorinoAuthClient: pecorinoAuthClient
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});
