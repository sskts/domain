// tslint:disable:no-implicit-dependencies
/**
 * 会員プログラムサービステスト
 */
import * as AWS from 'aws-sdk';
import * as assert from 'power-assert';
import * as redis from 'redis-mock';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;
let redisClient: redis.RedisClient;
let cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider;

before(() => {
    sandbox = sinon.createSandbox();
    redisClient = redis.createClient();
    cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
});

describe('会員プログラム登録タスクを作成する', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('リポジトリーが正常であればタスクを作成できるはず', async () => {
        const programMembership = {
            offers: [{}]
        };
        const seller = { name: {} };
        const task = {};
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const programMembershipRepo = new sskts.repository.ProgramMembership(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(programMembershipRepo).expects('search').once().resolves([programMembership]);
        sandbox.mock(taskRepo).expects('save').once().resolves(task);

        const result = await sskts.service.programMembership.createRegisterTask(<any>{
            agent: {},
            seller: {}
        })({
            organization: organizationRepo,
            programMembership: programMembershipRepo,
            task: taskRepo
        });
        assert.equal(typeof result, 'object');
        sandbox.verify();
    });
});

describe('会員プログラムに登録する', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('リポジトリーが正常であれば登録できるはず', async () => {
        const creditCard = { cardSeq: 'cardSeq' };
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderNumberRepo = new sskts.repository.OrderNumber(redisClient);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const programMembershipRepo = new sskts.repository.ProgramMembership(sskts.mongoose.connection);
        const registerActionInProgressRepoRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        sandbox.mock(ownershipInfoRepo).expects('search').once().resolves([]);
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(registerActionInProgressRepoRepo).expects('lock').once().resolves(1);
        sandbox.mock(actionRepo).expects('complete').once().resolves({});
        sandbox.mock(sskts.service.transaction.placeOrderInProgress).expects('start').once()
            .returns(async () => Promise.resolve({}));
        sandbox.mock(sskts.service.person.creditCard).expects('find').once()
            .returns(async () => Promise.resolve([creditCard]));
        sandbox.mock(sskts.service.transaction.placeOrderInProgress.action.authorize.offer.programMembership)
            .expects('create').once().returns(async () => Promise.resolve({}));
        sandbox.mock(sskts.service.transaction.placeOrderInProgress.action.authorize.paymentMethod.creditCard)
            .expects('create').once().returns(async () => Promise.resolve({}));
        sandbox.mock(personRepo).expects('getUserAttributes').once().resolves({});
        sandbox.mock(sskts.service.transaction.placeOrderInProgress).expects('setCustomerContact').once()
            .returns(async () => Promise.resolve({}));
        sandbox.mock(sskts.service.transaction.placeOrderInProgress).expects('confirm').once()
            .returns(async () => Promise.resolve({}));

        const result = await sskts.service.programMembership.register(<any>{
            agent: {
                memberOf: { membershipNumber: 'membershipNumber' }
            },
            object: {
                itemOffered: {
                    id: 'programMembershipId',
                    offers: [],
                    hostingOrganization: {}
                }
            }
        })({
            action: actionRepo,
            orderNumber: orderNumberRepo,
            organization: organizationRepo,
            ownershipInfo: ownershipInfoRepo,
            person: personRepo,
            programMembership: programMembershipRepo,
            registerActionInProgressRepo: registerActionInProgressRepoRepo,
            transaction: transactionRepo
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('会員プログラム登録解除タスクを作成する', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('リポジトリーが正常であればタスクを作成できるはず', async () => {
        const ownershipInfo = {};
        const task = {};
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
        sandbox.mock(ownershipInfoRepo).expects('search').once().resolves([ownershipInfo]);
        sandbox.mock(taskRepo).expects('save').once().resolves(task);

        const result = await sskts.service.programMembership.createUnRegisterTask(<any>{
            agent: { memberOf: { membershipNumber: 'membershipNumber' } },
            ownershipInfoIdentifier: 'ownershipInfoIdentifier'
        })({
            ownershipInfo: ownershipInfoRepo,
            task: taskRepo
        });
        assert.equal(typeof result, 'object');
        sandbox.verify();
    });
});

describe('会員プログラム登録解除', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('リポジトリーが正常であればアクションを完了できるはず', async () => {
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(taskRepo.taskModel).expects('findOneAndUpdate').once()
            .chain('exec').resolves({});
        sandbox.mock(ownershipInfoRepo.ownershipInfoModel).expects('findOneAndUpdate').once()
            .chain('exec').resolves({});
        sandbox.mock(actionRepo).expects('complete').once().resolves({});

        const result = await sskts.service.programMembership.unRegister(<any>{
            object: {
                typeOfGood: { id: 'programMembershipId' },
                ownedBy: { memberOf: { membershipNumber: 'membershipNumber' } }
            }
        })({
            action: actionRepo,
            ownershipInfo: ownershipInfoRepo,
            task: taskRepo
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});
