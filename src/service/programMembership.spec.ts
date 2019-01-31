// tslint:disable:no-implicit-dependencies
/**
 * 会員プログラムサービステスト
 */
import { AWS } from '@cinerino/domain';
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

    it('リポジトリが正常であればタスクを作成できるはず', async () => {
        const programMembership = {
            offers: [{ price: 123 }]
        };
        const seller = { name: {} };
        const task = {};
        const sellerRepo = new sskts.repository.Seller(sskts.mongoose.connection);
        const programMembershipRepo = new sskts.repository.ProgramMembership(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
        sandbox.mock(sellerRepo).expects('findById').once().resolves(seller);
        sandbox.mock(programMembershipRepo).expects('search').once().resolves([programMembership]);
        sandbox.mock(taskRepo).expects('save').once().resolves(task);

        const result = await sskts.service.programMembership.createRegisterTask(<any>{
            agent: {},
            seller: {}
        })({
            seller: sellerRepo,
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

    it('リポジトリが正常であれば登録できるはず', async () => {
        const creditCard = { cardSeq: 'cardSeq' };
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderNumberRepo = new sskts.repository.OrderNumber(redisClient);
        const sellerRepo = new sskts.repository.Seller(sskts.mongoose.connection);
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
                    offers: [{ price: 123 }],
                    hostingOrganization: {}
                }
            }
        })({
            action: actionRepo,
            orderNumber: orderNumberRepo,
            seller: sellerRepo,
            ownershipInfo: ownershipInfoRepo,
            person: personRepo,
            programMembership: programMembershipRepo,
            registerActionInProgressRepo: registerActionInProgressRepoRepo,
            transaction: transactionRepo
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('リポジトリが正常であれば登録できて、ポイントを追加できるはず', async () => {
        const creditCard = { cardSeq: 'cardSeq' };
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderNumberRepo = new sskts.repository.OrderNumber(redisClient);
        const sellerRepo = new sskts.repository.Seller(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const programMembershipRepo = new sskts.repository.ProgramMembership(sskts.mongoose.connection);
        const registerActionInProgressRepoRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const depositService = new sskts.pecorinoapi.service.transaction.Deposit(<any>{});
        const fakeOwnershipInfo = [{
            typeOfGood: { accountNumber: '123' }
        }];
        const fakeTransaction = {
            seller: { name: {} },
            agent: {}
        };

        sandbox.mock(ownershipInfoRepo).expects('search').twice().resolves(fakeOwnershipInfo).onFirstCall().resolves([]);
        sandbox.mock(actionRepo).expects('start').twice().resolves({});
        sandbox.mock(registerActionInProgressRepoRepo).expects('lock').once().resolves(1);
        sandbox.mock(actionRepo).expects('complete').twice().resolves({});
        sandbox.mock(sskts.service.transaction.placeOrderInProgress).expects('start').once()
            .returns(async () => Promise.resolve(fakeTransaction));
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
        sandbox.mock(depositService).expects('start').once().resolves({});

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
            seller: sellerRepo,
            ownershipInfo: ownershipInfoRepo,
            person: personRepo,
            programMembership: programMembershipRepo,
            registerActionInProgressRepo: registerActionInProgressRepoRepo,
            transaction: transactionRepo,
            depositService: depositService
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('ポイントを追加する時、所有権が見つけなかったら、エラーとなるはず', async () => {
        // const creditCard = { cardSeq: 'cardSeq' };
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderNumberRepo = new sskts.repository.OrderNumber(redisClient);
        const sellerRepo = new sskts.repository.Seller(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const programMembershipRepo = new sskts.repository.ProgramMembership(sskts.mongoose.connection);
        const registerActionInProgressRepoRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const depositService = new sskts.pecorinoapi.service.transaction.Deposit(<any>{});
        const fakeTransaction = {
            seller: { name: {} },
            agent: {}
        };

        sandbox.mock(ownershipInfoRepo).expects('search').twice().resolves([]);
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(registerActionInProgressRepoRepo).expects('lock').once().resolves(1);
        sandbox.mock(actionRepo).expects('giveUp').once().resolves({});
        sandbox.mock(registerActionInProgressRepoRepo).expects('unlock').once().resolves();
        sandbox.mock(sskts.service.transaction.placeOrderInProgress).expects('start').once()
            .returns(async () => Promise.resolve(fakeTransaction));
        sandbox.mock(sskts.service.person.creditCard).expects('find').never();
        sandbox.mock(sskts.service.transaction.placeOrderInProgress.action.authorize.offer.programMembership)
            .expects('create').never();
        sandbox.mock(sskts.service.transaction.placeOrderInProgress.action.authorize.paymentMethod.creditCard)
            .expects('create').never();
        sandbox.mock(personRepo).expects('getUserAttributes').never();
        sandbox.mock(sskts.service.transaction.placeOrderInProgress).expects('setCustomerContact').never();
        sandbox.mock(sskts.service.transaction.placeOrderInProgress).expects('confirm').never();
        sandbox.mock(depositService).expects('start').never();

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
            seller: sellerRepo,
            ownershipInfo: ownershipInfoRepo,
            person: personRepo,
            programMembership: programMembershipRepo,
            registerActionInProgressRepo: registerActionInProgressRepoRepo,
            transaction: transactionRepo,
            depositService: depositService
        }).catch((err) => err);
        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('ポイントを追加する時、エラーが発生すればエラーとなるはず', async () => {
        // const creditCard = { cardSeq: 'cardSeq' };
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderNumberRepo = new sskts.repository.OrderNumber(redisClient);
        const sellerRepo = new sskts.repository.Seller(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const programMembershipRepo = new sskts.repository.ProgramMembership(sskts.mongoose.connection);
        const registerActionInProgressRepoRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const depositService = new sskts.pecorinoapi.service.transaction.Deposit(<any>{});
        const fakeOwnershipInfo = [{
            typeOfGood: { accountNumber: '123' }
        }];
        const fakeTransaction = {
            seller: { name: {} },
            agent: {}
        };

        sandbox.mock(ownershipInfoRepo).expects('search').twice().resolves(fakeOwnershipInfo).onFirstCall().resolves([]);
        sandbox.mock(actionRepo).expects('start').twice().resolves({});
        sandbox.mock(registerActionInProgressRepoRepo).expects('lock').once().resolves(1);
        sandbox.mock(actionRepo).expects('giveUp').twice().resolves({});
        sandbox.mock(registerActionInProgressRepoRepo).expects('unlock').once().resolves();
        sandbox.mock(sskts.service.transaction.placeOrderInProgress).expects('start').once()
            .returns(async () => Promise.resolve(fakeTransaction));
        sandbox.mock(sskts.service.person.creditCard).expects('find').never();
        sandbox.mock(sskts.service.transaction.placeOrderInProgress.action.authorize.offer.programMembership)
            .expects('create').never();
        sandbox.mock(sskts.service.transaction.placeOrderInProgress.action.authorize.paymentMethod.creditCard)
            .expects('create').never();
        sandbox.mock(personRepo).expects('getUserAttributes').never();
        sandbox.mock(sskts.service.transaction.placeOrderInProgress).expects('setCustomerContact').never();
        sandbox.mock(sskts.service.transaction.placeOrderInProgress).expects('confirm').never();
        sandbox.mock(depositService).expects('start').once().rejects('fake error');

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
            seller: sellerRepo,
            ownershipInfo: ownershipInfoRepo,
            person: personRepo,
            programMembership: programMembershipRepo,
            registerActionInProgressRepo: registerActionInProgressRepoRepo,
            transaction: transactionRepo,
            depositService: depositService
        }).catch((err) => err);
        assert.equal(result, 'fake error');
        sandbox.verify();
    });

    it('すでに登録済であれば何もしないはず', async () => {
        const ownershipInfo = {
            typeOfGood: { id: 'programMembershipId' }
        };
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderNumberRepo = new sskts.repository.OrderNumber(redisClient);
        const sellerRepo = new sskts.repository.Seller(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const programMembershipRepo = new sskts.repository.ProgramMembership(sskts.mongoose.connection);
        const registerActionInProgressRepoRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        sandbox.mock(ownershipInfoRepo).expects('search').once().resolves([ownershipInfo]);
        sandbox.mock(actionRepo).expects('start').never();

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
            seller: sellerRepo,
            ownershipInfo: ownershipInfoRepo,
            person: personRepo,
            programMembership: programMembershipRepo,
            registerActionInProgressRepo: registerActionInProgressRepoRepo,
            transaction: transactionRepo
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('注文プロセスでエラーが発生すればアクションを断念するはず', async () => {
        const startPlaceOrderError = new Error('startPlaceOrderError');
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderNumberRepo = new sskts.repository.OrderNumber(redisClient);
        const sellerRepo = new sskts.repository.Seller(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const programMembershipRepo = new sskts.repository.ProgramMembership(sskts.mongoose.connection);
        const registerActionInProgressRepoRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        sandbox.mock(ownershipInfoRepo).expects('search').once().resolves([]);
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(registerActionInProgressRepoRepo).expects('lock').once().resolves(1);
        sandbox.mock(sskts.service.transaction.placeOrderInProgress).expects('start').once()
            .returns(async () => Promise.reject(startPlaceOrderError));
        sandbox.mock(registerActionInProgressRepoRepo).expects('unlock').once().resolves();
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(actionRepo).expects('giveUp').once().resolves({});

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
            seller: sellerRepo,
            ownershipInfo: ownershipInfoRepo,
            person: personRepo,
            programMembership: programMembershipRepo,
            registerActionInProgressRepo: registerActionInProgressRepoRepo,
            transaction: transactionRepo
        }).catch((err) => err);
        assert.deepEqual(result, startPlaceOrderError);
        sandbox.verify();
    });

    it('クレジットカードが見つからなければアクションを断念するはず', async () => {
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const orderNumberRepo = new sskts.repository.OrderNumber(redisClient);
        const sellerRepo = new sskts.repository.Seller(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const programMembershipRepo = new sskts.repository.ProgramMembership(sskts.mongoose.connection);
        const registerActionInProgressRepoRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        sandbox.mock(ownershipInfoRepo).expects('search').once().resolves([]);
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(registerActionInProgressRepoRepo).expects('lock').once().resolves(1);
        sandbox.mock(sskts.service.transaction.placeOrderInProgress).expects('start').once().returns(async () => Promise.resolve({}));
        sandbox.mock(sskts.service.transaction.placeOrderInProgress.action.authorize.offer.programMembership)
            .expects('create').once().returns(async () => Promise.resolve({}));
        sandbox.mock(sskts.service.person.creditCard).expects('find').once().returns(async () => Promise.resolve([]));
        sandbox.mock(registerActionInProgressRepoRepo).expects('unlock').once().resolves(1);
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(actionRepo).expects('giveUp').once().resolves({});

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
            seller: sellerRepo,
            ownershipInfo: ownershipInfoRepo,
            person: personRepo,
            programMembership: programMembershipRepo,
            registerActionInProgressRepo: registerActionInProgressRepoRepo,
            transaction: transactionRepo
        }).catch((err) => err);
        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });
});

describe('会員プログラム登録解除タスクを作成する', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('リポジトリが正常であればタスクを作成できるはず', async () => {
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

    it('リポジトリが正常であればアクションを完了できるはず', async () => {
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

    it('リポジトリでエラーが発生すればアクションを断念するはず', async () => {
        const findTaskError = new Error('findTaskError');
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(taskRepo.taskModel).expects('findOneAndUpdate').once().chain('exec').rejects(findTaskError);
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(actionRepo).expects('giveUp').once().resolves({});

        const result = await sskts.service.programMembership.unRegister(<any>{
            object: {
                typeOfGood: { id: 'programMembershipId' },
                ownedBy: { memberOf: { membershipNumber: 'membershipNumber' } }
            }
        })({
            action: actionRepo,
            ownershipInfo: ownershipInfoRepo,
            task: taskRepo
        }).catch((err) => err);
        assert.deepEqual(result, findTaskError);
        sandbox.verify();
    });

    it('パラメーターに所属会員プログラムがない場合、エラーとなるはず', async () => {
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(taskRepo.taskModel).expects('findOneAndUpdate').once()
            .chain('exec').resolves({});
        sandbox.mock(ownershipInfoRepo.ownershipInfoModel).expects('findOneAndUpdate').once()
            .chain('exec').resolves({});
        sandbox.mock(actionRepo).expects('giveUp').once().resolves({});
        sandbox.mock(cognitoIdentityServiceProvider).expects('adminDisableUser').never();

        const result = await sskts.service.programMembership.unRegister(<any>{
            object: {
                typeOfGood: { id: 'programMembershipId' },
                ownedBy: { memberOf: { membershipNumber: 'membershipNumber' } }
            },
            agent: {}
        })({
            action: actionRepo,
            ownershipInfo: ownershipInfoRepo,
            task: taskRepo,
            person: personRepo
        }).catch((err) => (err));
        assert.deepEqual(result, new sskts.factory.errors.NotFound('params.agent.memberOf'));
        sandbox.verify();
    });

    it('パラメーターにcognitoのusernameがない場合、エラーとなるはず', async () => {
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(taskRepo.taskModel).expects('findOneAndUpdate').once()
            .chain('exec').resolves({});
        sandbox.mock(ownershipInfoRepo.ownershipInfoModel).expects('findOneAndUpdate').once()
            .chain('exec').resolves({});
        sandbox.mock(actionRepo).expects('giveUp').once().resolves({});
        sandbox.mock(cognitoIdentityServiceProvider).expects('adminDisableUser').never();

        const result = await sskts.service.programMembership.unRegister(<any>{
            object: {
                typeOfGood: { id: 'programMembershipId' },
                ownedBy: { memberOf: { membershipNumber: 'membershipNumber' } }
            },
            agent: { memberOf: {} }
        })({
            action: actionRepo,
            ownershipInfo: ownershipInfoRepo,
            task: taskRepo,
            person: personRepo
        }).catch((err) => (err));
        assert.deepEqual(result, new sskts.factory.errors.NotFound('params.agent.memberOf.membershipNumber'));
        sandbox.verify();
    });

    it('リポジトリとAWS正常であればアクションを完了できるはず', async () => {
        const personRepo = new sskts.repository.Person(cognitoIdentityServiceProvider);
        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
        sandbox.mock(actionRepo).expects('start').once().resolves({});
        sandbox.mock(taskRepo.taskModel).expects('findOneAndUpdate').once()
            .chain('exec').resolves({});
        sandbox.mock(ownershipInfoRepo.ownershipInfoModel).expects('findOneAndUpdate').once()
            .chain('exec').resolves({});
        sandbox.mock(actionRepo).expects('complete').once().resolves({});
        sandbox.mock(personRepo).expects('unregister').once();

        const result = await sskts.service.programMembership.unRegister(<any>{
            object: {
                typeOfGood: { id: 'programMembershipId' },
                ownedBy: { memberOf: { membershipNumber: 'membershipNumber' } }
            },
            agent: { memberOf: { membershipNumber: 'username' } }
        })({
            action: actionRepo,
            ownershipInfo: ownershipInfoRepo,
            task: taskRepo,
            person: personRepo
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});
