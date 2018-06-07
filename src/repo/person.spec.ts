// tslint:disable:no-implicit-dependencies
/**
 * ユーザーリポジトリーテスト
 */
import * as AWS from 'aws-sdk';
import { } from 'mocha';
import * as assert from 'power-assert';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.createSandbox();
});

describe('管理者権限でユーザー属性を取得する', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('AWSが正常であればユーザー属性を取得できるはず', async () => {
        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(<any>{});
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const data = {
            UserAttributes: []
        };
        sandbox.mock(cognitoIdentityServiceProvider).expects('adminGetUser').once().callsArgWith(1, null, data);

        const result = await personRepo.getUserAttributes({
            userPooId: 'userPooId',
            username: 'username'
        });
        assert.equal(typeof result, 'object');
        sandbox.verify();
    });
});

describe('IDでユーザーを検索する', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('ユーザーが存在すればオブジェクトを取得できるはず', async () => {
        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(<any>{});
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const data = {
            Users: [{
                Attributes: [
                    { Name: 'given_name', Value: '' },
                    { Name: 'family_name', Value: '' },
                    { Name: 'email', Value: '' },
                    { Name: 'phone_number', Value: '+819012345678' }
                ]
            }]
        };
        sandbox.mock(cognitoIdentityServiceProvider).expects('listUsers').once().callsArgWith(1, null, data);

        const result = await personRepo.findById({
            userPooId: 'userPooId',
            userId: 'userId'
        });
        assert.equal(typeof result, 'object');
        sandbox.verify();
    });
});

describe('アクセストークンでユーザー属性を取得する', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('ユーザーが存在すればオブジェクトを取得できるはず', async () => {
        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(<any>{});
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const data = {
            UserAttributes: []
        };
        sandbox.mock(cognitoIdentityServiceProvider).expects('getUser').once().callsArgWith(1, null, data);

        const result = await personRepo.getUserAttributesByAccessToken('accessToken');
        assert.equal(typeof result, 'object');
        sandbox.verify();
    });
});

describe('アクセストークンでユーザー属性を更新する', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('AWSが正常であれば成功するはず', async () => {
        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(<any>{});
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        sandbox.mock(cognitoIdentityServiceProvider).expects('updateUserAttributes').once().callsArgWith(1, null);

        const result = await personRepo.updateContactByAccessToken({
            accessToken: '',
            contact: <any>{
                telephone: '09012345678'
            }
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});
