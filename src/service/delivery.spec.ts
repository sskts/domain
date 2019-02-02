// tslint:disable:no-implicit-dependencies
/**
 * 配送サービステスト
 */
import * as mongoose from 'mongoose';
import * as assert from 'power-assert';
import * as redis from 'redis-mock';
import * as sinon from 'sinon';
// tslint:disable-next-line:no-require-imports no-var-requires
require('sinon-mongoose');
import * as sskts from '../index';

let sandbox: sinon.SinonSandbox;
let redisClient: redis.RedisClient;

before(() => {
    sandbox = sinon.createSandbox();
    redisClient = redis.createClient();
});

describe('注文アイテムを配送する', () => {
    beforeEach(() => {
        sandbox.restore();
    });

    it('注文配送アクションを完了できるはず', async () => {
        const sendOrderActionAttributes = {
            typeOf: sskts.factory.actionType.SendAction,
            potentialActions: {
                sendEmailMessage: {
                    typeOf: sskts.factory.actionType.SendAction,
                    object: { identifier: 'emailMessageIdentifier' }
                },
                registerProgramMembership: [{}]
            }
        };
        const orderActionAttributes = {
            typeOf: sskts.factory.actionType.OrderAction,
            potentialActions: { sendOrder: sendOrderActionAttributes }
        };
        const transaction = {
            id: 'transactionId',
            result: {
                order: {
                    orderNumber: 'orderNumber',
                    acceptedOffers: [
                        { itemOffered: { reservedTicket: {} } }
                    ]
                },
                ownershipInfos: [{ identifier: 'identifier', typeOfGood: { typeOf: sskts.factory.reservationType.EventReservation } }]
            },
            potentialActions: { order: orderActionAttributes },
            object: {
                customerContact: {
                    telephone: '+819012345678'
                },
                authorizeActions: [
                    {
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        object: { typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation },
                        result: { updTmpReserveSeatArgs: {}, updTmpReserveSeatResult: {} }
                    }
                ]
            }
        };
        const action = { typeOf: sendOrderActionAttributes.typeOf, id: 'actionId' };
        const stateReserveResult = null;

        const actionRepo = new sskts.repository.Action(mongoose.connection);
        const orderRepo = new sskts.repository.Order(mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(mongoose.connection);
        const registerActionInProgressRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(mongoose.connection);
        const taskRepo = new sskts.repository.Task(mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(transaction);
        sandbox.mock(taskRepo.taskModel).expects('findOne').once().chain('exec').resolves(null);
        sandbox.mock(actionRepo).expects('start').once().withExactArgs(sendOrderActionAttributes).resolves(action);
        sandbox.mock(actionRepo).expects('complete').once().resolves(action);
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').once().resolves(stateReserveResult);
        sandbox.mock(sskts.COA.services.reserve).expects('updReserve').once().resolves(stateReserveResult);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(ownershipInfoRepo).expects('save').exactly(transaction.result.ownershipInfos.length).resolves();
        sandbox.mock(orderRepo).expects('changeStatus').once().resolves();
        sandbox.mock(taskRepo).expects('save').twice().resolves();
        // sandbox.mock(registerActionInProgressRepo).expects('unlock').never();

        const result = await sskts.service.delivery.sendOrder(transaction.id)({
            action: actionRepo,
            order: orderRepo,
            ownershipInfo: ownershipInfoRepo,
            registerActionInProgressRepo: registerActionInProgressRepo,
            transaction: transactionRepo,
            task: taskRepo
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('COA本予約済であれば本予約を実行しないはず', async () => {
        const sendOrderActionAttributes = {
            typeOf: sskts.factory.actionType.SendAction,
            potentialActions: {
                sendEmailMessage: {
                    typeOf: sskts.factory.actionType.SendAction,
                    object: { identifier: 'emailMessageIdentifier' }
                }
            }
        };
        const orderActionAttributes = {
            typeOf: sskts.factory.actionType.OrderAction,
            potentialActions: { sendOrder: sendOrderActionAttributes }
        };
        const transaction = {
            id: 'transactionId',
            result: {
                order: {
                    orderNumber: 'orderNumber',
                    acceptedOffers: [
                        { itemOffered: { reservedTicket: {} } }
                    ]
                },
                ownershipInfos: [
                    { identifier: 'identifier', typeOfGood: { typeOf: sskts.factory.reservationType.EventReservation } },
                    {
                        identifier: 'identifier2',
                        ownedBy: { memberOf: {} },
                        typeOfGood: { typeOf: 'ProgramMembership' }
                    }
                ]
            },
            potentialActions: {
                order: orderActionAttributes
            },
            object: {
                customerContact: {
                    telephone: '+819012345678'
                },
                authorizeActions: [
                    {
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        object: { typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation },
                        result: { updTmpReserveSeatArgs: {}, updTmpReserveSeatResult: {} }
                    },
                    {
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        object: { typeOf: 'Offer' },
                        result: {}
                    }
                ]
            }
        };
        const action = { typeOf: sendOrderActionAttributes.typeOf, id: 'actionId' };
        const stateReserveResult = {};

        const actionRepo = new sskts.repository.Action(mongoose.connection);
        const orderRepo = new sskts.repository.Order(mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(mongoose.connection);
        const registerActionInProgressRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(mongoose.connection);
        const taskRepo = new sskts.repository.Task(mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(transaction);
        sandbox.mock(taskRepo.taskModel).expects('findOne').once().chain('exec').resolves(null);
        sandbox.mock(actionRepo).expects('start').once().withExactArgs(sendOrderActionAttributes).resolves(action);
        sandbox.mock(actionRepo).expects('complete').once().resolves(action);
        sandbox.mock(actionRepo).expects('giveUp').never();
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').once().resolves(stateReserveResult);
        sandbox.mock(sskts.COA.services.reserve).expects('updReserve').never();
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(ownershipInfoRepo).expects('save').exactly(transaction.result.ownershipInfos.length).resolves();
        sandbox.mock(orderRepo).expects('changeStatus').once().resolves();
        sandbox.mock(taskRepo).expects('save').once().resolves();
        sandbox.mock(registerActionInProgressRepo).expects('unlock').once().resolves();

        const result = await sskts.service.delivery.sendOrder(transaction.id)({
            action: actionRepo,
            order: orderRepo,
            ownershipInfo: ownershipInfoRepo,
            registerActionInProgressRepo: registerActionInProgressRepo,
            transaction: transactionRepo,
            task: taskRepo
        });
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('注文取引結果が未定義であればNotFoundエラーとなるはず', async () => {
        const sendOrderActionAttributes = {
            typeOf: sskts.factory.actionType.SendAction,
            potentialActions: {
                sendEmailMessage: {
                    typeOf: sskts.factory.actionType.SendAction,
                    object: { identifier: 'emailMessageIdentifier' }
                }
            }
        };
        const orderActionAttributes = {
            typeOf: sskts.factory.actionType.OrderAction,
            potentialActions: { sendOrder: sendOrderActionAttributes }
        };
        const transaction = {
            id: 'transactionId',
            // result: {
            //     order: {
            //         orderNumber: 'orderNumber',
            //         acceptedOffers: [
            //             { itemOffered: { reservedTicket: {} } }
            //         ]
            //     },
            //     ownershipInfos: [{ identifier: 'identifier' }]
            // },
            potentialActions: { order: orderActionAttributes },
            object: {
                customerContact: {
                    telephone: '+819012345678'
                },
                authorizeActions: [
                    {
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        object: { typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation },
                        result: { updTmpReserveSeatArgs: {}, updTmpReserveSeatResult: {} }
                    }
                ]
            }
        };

        const actionRepo = new sskts.repository.Action(mongoose.connection);
        const orderRepo = new sskts.repository.Order(mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(mongoose.connection);
        const registerActionInProgressRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(mongoose.connection);
        const taskRepo = new sskts.repository.Task(mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(transaction);
        sandbox.mock(taskRepo.taskModel).expects('findOne').never();
        sandbox.mock(actionRepo).expects('start').never();
        sandbox.mock(ownershipInfoRepo).expects('save').never();
        sandbox.mock(orderRepo).expects('changeStatus').never();
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.delivery.sendOrder(transaction.id)({
            action: actionRepo,
            order: orderRepo,
            ownershipInfo: ownershipInfoRepo,
            registerActionInProgressRepo: registerActionInProgressRepo,
            transaction: transactionRepo,
            task: taskRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('注文取引の潜在アクションが未定義であればNotFoundエラーとなるはず', async () => {
        const transaction = {
            id: 'transactionId',
            result: {
                order: {
                    orderNumber: 'orderNumber',
                    acceptedOffers: [
                        { itemOffered: { reservedTicket: {} } }
                    ]
                },
                ownershipInfos: [{ identifier: 'identifier', typeOfGood: { typeOf: sskts.factory.reservationType.EventReservation } }]
            },
            // potentialActions: { order: orderActionAttributes },
            object: {
                customerContact: {
                    telephone: '+819012345678'
                },
                authorizeActions: [
                    {
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        object: { typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation },
                        result: { updTmpReserveSeatArgs: {}, updTmpReserveSeatResult: {} }
                    }
                ]
            }
        };

        const actionRepo = new sskts.repository.Action(mongoose.connection);
        const orderRepo = new sskts.repository.Order(mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(mongoose.connection);
        const registerActionInProgressRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(mongoose.connection);
        const taskRepo = new sskts.repository.Task(mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(transaction);
        sandbox.mock(taskRepo.taskModel).expects('findOne').never();
        sandbox.mock(actionRepo).expects('start').never();
        sandbox.mock(ownershipInfoRepo).expects('save').never();
        sandbox.mock(orderRepo).expects('changeStatus').never();
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.delivery.sendOrder(transaction.id)({
            action: actionRepo,
            order: orderRepo,
            ownershipInfo: ownershipInfoRepo,
            registerActionInProgressRepo: registerActionInProgressRepo,
            transaction: transactionRepo,
            task: taskRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('座席予約承認アクション結果が未定義であればNotFoundエラーとなるはず', async () => {
        const sendOrderActionAttributes = {
            typeOf: sskts.factory.actionType.SendAction,
            potentialActions: {
                sendEmailMessage: {
                    typeOf: sskts.factory.actionType.SendAction,
                    object: { identifier: 'emailMessageIdentifier' }
                }
            }
        };
        const orderActionAttributes = {
            typeOf: sskts.factory.actionType.OrderAction,
            potentialActions: { sendOrder: sendOrderActionAttributes }
        };
        const transaction = {
            id: 'transactionId',
            result: {
                order: {
                    orderNumber: 'orderNumber',
                    acceptedOffers: [
                        { itemOffered: { reservedTicket: {} } }
                    ]
                },
                ownershipInfos: [{ identifier: 'identifier', typeOfGood: { typeOf: sskts.factory.reservationType.EventReservation } }]
            },
            potentialActions: { order: orderActionAttributes },
            object: {
                customerContact: {
                    telephone: '+819012345678'
                },
                authorizeActions: [
                    {
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        object: { typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation }
                        // result: { updTmpReserveSeatArgs: {}, updTmpReserveSeatResult: {} }
                    }
                ]
            }
        };
        const action = { typeOf: sendOrderActionAttributes.typeOf, id: 'actionId' };

        const actionRepo = new sskts.repository.Action(mongoose.connection);
        const orderRepo = new sskts.repository.Order(mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(mongoose.connection);
        const registerActionInProgressRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(mongoose.connection);
        const taskRepo = new sskts.repository.Task(mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(transaction);
        sandbox.mock(taskRepo.taskModel).expects('findOne').never();
        sandbox.mock(actionRepo).expects('start').once().withExactArgs(sendOrderActionAttributes).resolves(action);
        // sandbox.mock(actionRepo).expects('start').never();
        sandbox.mock(ownershipInfoRepo).expects('save').never();
        sandbox.mock(orderRepo).expects('changeStatus').never();
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.delivery.sendOrder(transaction.id)({
            action: actionRepo,
            order: orderRepo,
            ownershipInfo: ownershipInfoRepo,
            registerActionInProgressRepo: registerActionInProgressRepo,
            transaction: transactionRepo,
            task: taskRepo
        }).catch((err) => err);
        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    // it('座席予約承認アクションが2つ以上あればNotImplementedエラーとなるはず', async () => {
    //     const sendOrderActionAttributes = {
    //         typeOf: sskts.factory.actionType.SendAction,
    //         potentialActions: {
    //             sendEmailMessage: {
    //                 typeOf: sskts.factory.actionType.SendAction,
    //                 object: { identifier: 'emailMessageIdentifier' }
    //             }
    //         }
    //     };
    //     const orderActionAttributes = {
    //         typeOf: sskts.factory.actionType.OrderAction,
    //         potentialActions: { sendOrder: sendOrderActionAttributes }
    //     };
    //     const transaction = {
    //         id: 'transactionId',
    //         result: {
    //             order: {
    //                 orderNumber: 'orderNumber',
    //                 acceptedOffers: [
    //                     { itemOffered: { reservedTicket: {} } }
    //                 ]
    //             },
    //             ownershipInfos: [{ identifier: 'identifier' }]
    //         },
    //         potentialActions: { order: orderActionAttributes },
    //         object: {
    //             customerContact: {
    //                 telephone: '+819012345678'
    //             },
    //             authorizeActions: [
    //                 {
    //                     typeOf: sskts.factory.actionType.AuthorizeAction,
    //                     actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
    //                     object: { typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation },
    //                     result: { updTmpReserveSeatArgs: {}, updTmpReserveSeatResult: {} }
    //                 },
    //                 {
    //                     typeOf: sskts.factory.actionType.AuthorizeAction,
    //                     actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
    //                     object: { typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation },
    //                     result: { updTmpReserveSeatArgs: {}, updTmpReserveSeatResult: {} }
    //                 }
    //             ]
    //         }
    //     };

    //     const actionRepo = new sskts.repository.Action(mongoose.connection);
    //     const orderRepo = new sskts.repository.Order(mongoose.connection);
    //     const ownershipInfoRepo = new sskts.repository.OwnershipInfo(mongoose.connection);
    //     const transactionRepo = new sskts.repository.Transaction(mongoose.connection);
    //     const taskRepo = new sskts.repository.Task(mongoose.connection);

    //     sandbox.mock(transactionRepo).expects('findById').once().resolves(transaction);
    //     sandbox.mock(taskRepo.taskModel).expects('findOne').never();
    //     sandbox.mock(actionRepo).expects('start').never();
    //     sandbox.mock(ownershipInfoRepo).expects('save').never();
    //     sandbox.mock(orderRepo).expects('changeStatus').never();
    //     sandbox.mock(taskRepo).expects('save').never();

    //     const result = await sskts.service.delivery.sendOrder(transaction.id)({
    //         action: actionRepo,
    //         order: orderRepo,
    //         ownershipInfo: ownershipInfoRepo,
    //         transaction: transactionRepo,
    //         task: taskRepo
    //     }).catch((err) => err);

    //     assert(result instanceof sskts.factory.errors.NotImplemented);
    //     sandbox.verify();
    // });

    it('注文取引に購入者連絡先が未定義であればNotFoundエラーとなるはず', async () => {
        const sendOrderActionAttributes = {
            typeOf: sskts.factory.actionType.SendAction,
            potentialActions: {
                sendEmailMessage: {
                    typeOf: sskts.factory.actionType.SendAction,
                    object: { identifier: 'emailMessageIdentifier' }
                }
            }
        };
        const orderActionAttributes = {
            typeOf: sskts.factory.actionType.OrderAction,
            potentialActions: { sendOrder: sendOrderActionAttributes }
        };
        const transaction = {
            id: 'transactionId',
            result: {
                order: {
                    orderNumber: 'orderNumber',
                    acceptedOffers: [
                        { itemOffered: { reservedTicket: {} } }
                    ]
                },
                ownershipInfos: [{ identifier: 'identifier', typeOfGood: { typeOf: sskts.factory.reservationType.EventReservation } }]
            },
            potentialActions: { order: orderActionAttributes },
            object: {
                // customerContact: {
                //     telephone: '+819012345678'
                // },
                authorizeActions: [
                    {
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        object: { typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation },
                        result: { updTmpReserveSeatArgs: {}, updTmpReserveSeatResult: {} }
                    }
                ]
            }
        };

        const actionRepo = new sskts.repository.Action(mongoose.connection);
        const orderRepo = new sskts.repository.Order(mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(mongoose.connection);
        const registerActionInProgressRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(mongoose.connection);
        const taskRepo = new sskts.repository.Task(mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(transaction);
        sandbox.mock(taskRepo.taskModel).expects('findOne').never();
        sandbox.mock(actionRepo).expects('start').never();
        sandbox.mock(ownershipInfoRepo).expects('save').never();
        sandbox.mock(orderRepo).expects('changeStatus').never();
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.delivery.sendOrder(transaction.id)({
            action: actionRepo,
            order: orderRepo,
            ownershipInfo: ownershipInfoRepo,
            registerActionInProgressRepo: registerActionInProgressRepo,
            transaction: transactionRepo,
            task: taskRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });

    it('予約状態抽出に失敗すればアクションにエラー結果が追加されるはず', async () => {
        const sendOrderActionAttributes = {
            typeOf: sskts.factory.actionType.SendAction,
            potentialActions: {
                sendEmailMessage: {
                    typeOf: sskts.factory.actionType.SendAction,
                    object: { identifier: 'emailMessageIdentifier' }
                }
            }
        };
        const orderActionAttributes = {
            typeOf: sskts.factory.actionType.OrderAction,
            potentialActions: { sendOrder: sendOrderActionAttributes }
        };
        const transaction = {
            id: 'transactionId',
            result: {
                order: {
                    orderNumber: 'orderNumber',
                    acceptedOffers: [
                        { itemOffered: { reservedTicket: {} } }
                    ]
                },
                ownershipInfos: [{ identifier: 'identifier', typeOfGood: { typeOf: sskts.factory.reservationType.EventReservation } }]
            },
            potentialActions: { order: orderActionAttributes },
            object: {
                customerContact: {
                    telephone: '+819012345678'
                },
                authorizeActions: [
                    {
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        object: { typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation },
                        result: { updTmpReserveSeatArgs: {}, updTmpReserveSeatResult: {} }
                    }
                ]
            }
        };
        const action = { typeOf: sendOrderActionAttributes.typeOf, id: 'actionId' };
        const stateReserveResult = new Error('stateReserveError');

        const actionRepo = new sskts.repository.Action(mongoose.connection);
        const orderRepo = new sskts.repository.Order(mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(mongoose.connection);
        const registerActionInProgressRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(mongoose.connection);
        const taskRepo = new sskts.repository.Task(mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(transaction);
        sandbox.mock(actionRepo).expects('start').once().withExactArgs(sendOrderActionAttributes).resolves(action);
        sandbox.mock(actionRepo).expects('complete').never();
        sandbox.mock(actionRepo).expects('giveUp').once().resolves(action);
        sandbox.mock(sskts.COA.services.reserve).expects('stateReserve').once().rejects(stateReserveResult);
        sandbox.mock(sskts.COA.services.reserve).expects('updReserve').never();
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(ownershipInfoRepo).expects('save').never();
        sandbox.mock(orderRepo).expects('changeStatus').never();
        sandbox.mock(taskRepo.taskModel).expects('findOne').never();
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.delivery.sendOrder(transaction.id)({
            action: actionRepo,
            order: orderRepo,
            ownershipInfo: ownershipInfoRepo,
            registerActionInProgressRepo: registerActionInProgressRepo,
            transaction: transactionRepo,
            task: taskRepo
        }).catch((err) => err);

        assert.deepEqual(result, stateReserveResult);
        sandbox.verify();
    });

    it('注文アクションの潜在アクションが未定義であればNotFoundエラーとなるはず', async () => {
        const orderActionAttributes = {
            typeOf: sskts.factory.actionType.OrderAction
            // potentialActions: { sendOrder: sendOrderActionAttributes }
        };
        const transaction = {
            id: 'transactionId',
            result: {
                order: {
                    orderNumber: 'orderNumber',
                    acceptedOffers: [
                        { itemOffered: { reservedTicket: {} } }
                    ]
                },
                ownershipInfos: [{ identifier: 'identifier', typeOfGood: { typeOf: sskts.factory.reservationType.EventReservation } }]
            },
            potentialActions: { order: orderActionAttributes },
            object: {
                customerContact: {
                    telephone: '+819012345678'
                },
                authorizeActions: [
                    {
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        object: { typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation },
                        result: { updTmpReserveSeatArgs: {}, updTmpReserveSeatResult: {} }
                    }
                ]
            }
        };

        const actionRepo = new sskts.repository.Action(mongoose.connection);
        const orderRepo = new sskts.repository.Order(mongoose.connection);
        const ownershipInfoRepo = new sskts.repository.OwnershipInfo(mongoose.connection);
        const registerActionInProgressRepo = new sskts.repository.action.RegisterProgramMembershipInProgress(redisClient);
        const transactionRepo = new sskts.repository.Transaction(mongoose.connection);
        const taskRepo = new sskts.repository.Task(mongoose.connection);

        sandbox.mock(transactionRepo).expects('findById').once().resolves(transaction);
        sandbox.mock(taskRepo.taskModel).expects('findOne').never();
        sandbox.mock(actionRepo).expects('start').never();
        sandbox.mock(ownershipInfoRepo).expects('save').never();
        sandbox.mock(orderRepo).expects('changeStatus').never();
        sandbox.mock(taskRepo).expects('save').never();

        const result = await sskts.service.delivery.sendOrder(transaction.id)({
            action: actionRepo,
            order: orderRepo,
            ownershipInfo: ownershipInfoRepo,
            registerActionInProgressRepo: registerActionInProgressRepo,
            transaction: transactionRepo,
            task: taskRepo
        }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.NotFound);
        sandbox.verify();
    });
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
                pecorinoEndpoint: 'https://example.com',
                pecorinoTransaction: {}
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
                pecorinoEndpoint: 'https://example.com',
                pecorinoTransaction: {}
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
                pecorinoEndpoint: 'pecorinoEndpoint',
                pecorinoTransaction: {}
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
