// tslint:disable:no-implicit-dependencies
/**
 * 進行中の注文取引サービステスト
 */
import * as waiter from '@waiter/domain';
import * as moment from 'moment-timezone';
import * as assert from 'power-assert';
// import * as pug from 'pug';
import * as redis from 'redis-mock';
import * as sinon from 'sinon';
import * as sskts from '../../index';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.createSandbox();
});

describe('start()', () => {
    beforeEach(() => {
        delete process.env.WAITER_PASSPORT_ISSUER;
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('販売者が存在すれば、開始できるはず', async () => {
        process.env.WAITER_PASSPORT_ISSUER = 'https://example.com';
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId'
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            identifier: 'sellerIdentifier'
        };
        const transaction = {
            expires: new Date()
        };
        const passportToken = 'passportToken';
        const passport = {
            scope: `placeOrderTransaction.${seller.identifier}`,
            iat: 123,
            exp: 123,
            iss: process.env.WAITER_PASSPORT_ISSUER,
            issueUnit: {}
        };

        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(transactionRepo).expects('start').once().resolves(transaction);
        sandbox.mock(waiter.service.passport).expects('verify').once().resolves(passport);

        const result = await sskts.service.transaction.placeOrderInProgress.start({
            expires: transaction.expires,
            clientUser: <any>{},
            customer: agent,
            seller: seller,
            passportToken: passportToken
        })({
            transaction: transactionRepo,
            organization: organizationRepo
        });

        assert.deepEqual(result, transaction);
        // assert.equal(result.expires, transaction.expires);
        sandbox.verify();
    });

    it('クライアントユーザーにusernameが存在すれば、会員として開始できるはず', async () => {
        process.env.WAITER_PASSPORT_ISSUER = 'https://example.com';
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId'
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            identifier: 'sellerIdentifier'
        };
        const transaction = {
            expires: new Date()
        };
        const clientUser = {
            username: 'username'
        };
        const passportToken = 'passportToken';
        const passport = {
            scope: `placeOrderTransaction.${seller.identifier}`,
            iat: 123,
            exp: 123,
            iss: process.env.WAITER_PASSPORT_ISSUER,
            issueUnit: {}
        };

        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(transactionRepo).expects('start').once().resolves(transaction);
        sandbox.mock(waiter.service.passport).expects('verify').once().resolves(passport);

        const result = await sskts.service.transaction.placeOrderInProgress.start({
            expires: transaction.expires,
            clientUser: <any>clientUser,
            customer: agent,
            seller: seller,
            passportToken: passportToken
        })({
            transaction: transactionRepo,
            organization: organizationRepo
        });

        assert.deepEqual(result, transaction);
        sandbox.verify();
    });

    it('許可証トークンの検証に成功すれば、開始できるはず', async () => {
        process.env.WAITER_PASSPORT_ISSUER = 'https://example.com';
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId'
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            identifier: 'sellerIdentifier'
        };
        const transaction = {
            expires: new Date()
        };
        const passportToken = 'passportToken';
        const passport = {
            scope: `placeOrderTransaction.${seller.identifier}`,
            iat: 123,
            exp: 123,
            iss: process.env.WAITER_PASSPORT_ISSUER,
            issueUnit: {}
        };

        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(waiter.service.passport).expects('verify').once().resolves(passport);
        sandbox.mock(transactionRepo).expects('start').once().resolves(transaction);

        const result = await sskts.service.transaction.placeOrderInProgress.start({
            expires: transaction.expires,
            passportToken: passportToken,
            clientUser: <any>{},
            customer: agent,
            seller: seller
        })({
            transaction: transactionRepo,
            organization: organizationRepo
        });
        assert.deepEqual(result, transaction);
        sandbox.verify();
    });

    it('許可証トークンの検証に失敗すれば、Argumentエラーとなるはず', async () => {
        process.env.WAITER_PASSPORT_ISSUER = 'https://example.com';
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId'
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            identifier: 'sellerIdentifier'
        };
        const transaction = {
            expires: new Date()
        };
        const passportToken = 'passportToken';
        const verifyResult = new Error('verifyError');

        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(waiter.service.passport).expects('verify').once().rejects(verifyResult);
        sandbox.mock(transactionRepo).expects('start').never();

        const result = await sskts.service.transaction.placeOrderInProgress.start({
            expires: transaction.expires,
            passportToken: passportToken,
            clientUser: <any>{},
            customer: agent,
            seller: seller
        })({
            transaction: transactionRepo,
            organization: organizationRepo
        }).catch((err) => err);
        assert(result instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });

    it('許可証の発行者が期待通りでなければ、Argumentエラーとなるはず', async () => {
        process.env.WAITER_PASSPORT_ISSUER = 'https://example.com';
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId'
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            identifier: 'sellerIdentifier'
        };
        const transaction = {
            expires: new Date()
        };
        const passportToken = 'passportToken';
        const passport = {
            scope: `placeOrderTransaction.${seller.id}`,
            iat: 123,
            exp: 123,
            iss: 'invalidIssuer',
            issueUnit: {}
        };

        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(waiter.service.passport).expects('verify').once().resolves(passport);
        sandbox.mock(transactionRepo).expects('start').once().never();

        const result = await sskts.service.transaction.placeOrderInProgress.start({
            expires: transaction.expires,
            passportToken: passportToken,
            clientUser: <any>{},
            customer: agent,
            seller: seller
        })({
            transaction: transactionRepo,
            organization: organizationRepo
        }).catch((err) => err);
        assert(result instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });

    // it('許可証がない場合、ArgumentNullエラーとなるはず', async () => {
    //     const agent = {
    //         typeOf: sskts.factory.personType.Person,
    //         id: 'agentId'
    //     };
    //     const seller = {
    //         typeOf: sskts.factory.organizationType.MovieTheater,
    //         id: 'sellerId',
    //         name: { ja: 'ja', en: 'ne' },
    //         identifier: 'sellerIdentifier'
    //     };
    //     const transaction = {
    //         expires: new Date()
    //     };

    //     const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
    //     const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

    //     sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
    //     sandbox.mock(transactionRepo).expects('start').never();

    //     const result = await sskts.service.transaction.placeOrderInProgress.start({
    //         expires: transaction.expires,
    //         clientUser: <any>{},
    //         customer: agent,
    //         seller: seller,
    //         passportToken: <any>undefined
    //     })({
    //         transaction: transactionRepo,
    //         organization: organizationRepo
    //     }).catch((err) => err);
    //     assert(result instanceof sskts.factory.errors.ArgumentNull);
    //     sandbox.verify();
    // });

    it('取引作成時に何かしらエラーが発生すれば、そのままのエラーになるはず', async () => {
        process.env.WAITER_PASSPORT_ISSUER = 'https://example.com';
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId'
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            identifier: 'sellerIdentifier'
        };
        const expires = new Date();
        const startResult = new Error('startError');
        const passportToken = 'passportToken';
        const passport = {
            scope: `placeOrderTransaction.${seller.identifier}`,
            iat: 123,
            exp: 123,
            iss: process.env.WAITER_PASSPORT_ISSUER,
            issueUnit: {}
        };

        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(waiter.service.passport).expects('verify').once().resolves(passport);
        sandbox.mock(transactionRepo).expects('start').once().rejects(startResult);

        const result = await sskts.service.transaction.placeOrderInProgress.start({
            expires: expires,
            passportToken: passportToken,
            clientUser: <any>{},
            customer: agent,
            seller: seller
        })({
            transaction: transactionRepo,
            organization: organizationRepo
        }).catch((err) => err);
        assert.deepEqual(result, startResult);
        sandbox.verify();
    });

    it('許可証を重複使用しようとすれば、AlreadyInUseエラーとなるはず', async () => {
        process.env.WAITER_PASSPORT_ISSUER = 'https://example.com';
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId'
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            identifier: 'sellerIdentifier'
        };
        const expires = new Date();
        const startResult = sskts.mongoose.mongo.MongoError.create({ code: 11000 });
        const passportToken = 'passportToken';
        const passport = {
            scope: `placeOrderTransaction.${seller.identifier}`,
            iat: 123,
            exp: 123,
            iss: process.env.WAITER_PASSPORT_ISSUER,
            issueUnit: {}
        };

        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(waiter.service.passport).expects('verify').once().resolves(passport);
        sandbox.mock(transactionRepo).expects('start').once().rejects(startResult);

        const result = await sskts.service.transaction.placeOrderInProgress.start({
            expires: expires,
            passportToken: passportToken,
            clientUser: <any>{},
            customer: agent,
            seller: seller
        })({
            transaction: transactionRepo,
            organization: organizationRepo
        }).catch((err) => err);
        assert(result instanceof sskts.factory.errors.AlreadyInUse);
        sandbox.verify();
    });
});

describe('setCustomerContact()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('取引が進行中であれば、エラーにならないはず', async () => {
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
            seller: seller,
            object: {
            }
        };
        const contact = {
            givenName: 'givenName',
            familyName: 'familyName',
            telephone: '09012345678',
            email: 'john@example.com'
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(transactionRepo).expects('setCustomerContactOnPlaceOrderInProgress').once()
            .withArgs(transaction.id).resolves();

        const result = await sskts.service.transaction.placeOrderInProgress.setCustomerContact({
            agentId: agent.id,
            transactionId: transaction.id,
            contact: <any>contact
        })({ transaction: transactionRepo });

        assert.equal(typeof result, 'object');
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
            seller: seller,
            object: {
            }
        };
        const contact = {
            givenName: 'givenName',
            familyName: 'familyName',
            telephone: '09012345678',
            email: 'john@example.com'
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(transactionRepo).expects('setCustomerContactOnPlaceOrderInProgress').never();

        const result = await sskts.service.transaction.placeOrderInProgress.setCustomerContact({
            agentId: agent.id,
            transactionId: transaction.id,
            contact: <any>contact
        })({ transaction: transactionRepo }).catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });

    it('電話番号フォーマットが不適切であれば、Argumentエラーが投げられるはず', async () => {
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
            seller: seller,
            object: {
            }
        };
        const contact = {
            givenName: 'givenName',
            familyName: 'familyName',
            telephone: '090123456789',
            email: 'john@example.com'
        };

        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

        sandbox.mock(transactionRepo).expects('findInProgressById').never().resolves(transaction);
        sandbox.mock(transactionRepo).expects('setCustomerContactOnPlaceOrderInProgress').never();

        const result = await sskts.service.transaction.placeOrderInProgress.setCustomerContact({
            agentId: agent.id,
            transactionId: transaction.id,
            contact: <any>contact
        })({ transaction: transactionRepo }).catch((err) => err);
        assert(result instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });
});

describe('confirm()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    // tslint:disable-next-line:max-func-body-length
    it('確定条件が整っていれば、確定できるはず', async () => {
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId',
            url: '',
            identifier: [{ name: 'xxx', value: 'xxx' }]
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: 'sellerName',
            url: '',
            telephone: '0312345678',
            location: {}
        };
        const customerContact = {
            familyName: 'familyName',
            givenName: 'givenName',
            telephone: '+819012345678',
            email: 'test@example.com'
        };
        const transaction = {
            typeOf: sskts.factory.transactionType.PlaceOrder,
            id: 'transactionId',
            status: sskts.factory.transactionStatusType.InProgress,
            // tslint:disable-next-line:no-magic-numbers
            expires: moment().add(10, 'minutes').toDate(),
            tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported,
            agent: agent,
            seller: seller,
            object: {
                customerContact: customerContact,
                clientUser: <any>{ client_id: 'client_id', iss: 'https://example.com' },
                authorizeActions: []
            }
        };
        const creditCardAuthorizeActions = [
            {
                id: 'actionId2',
                actionStatus: 'CompletedActionStatus',
                agent: transaction.agent,
                object: {
                    typeOf: sskts.factory.action.authorize.paymentMethod.creditCard.ObjectType.CreditCard
                },
                result: {
                    execTranResult: {
                        orderId: 'orderId'
                    },
                    price: 1234
                },
                endDate: moment().add(-1, 'minute').toDate(),
                purpose: {}
            }
        ];
        const seatReservationAuthorizeActions = [
            {
                id: 'actionId1',
                actionStatus: 'CompletedActionStatus',
                agent: transaction.seller,
                object: {
                    typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation,
                    offers: [],
                    individualScreeningEvent: {
                        superEvent: {
                            location: {
                                typeOf: 'MovieTheater',
                                name: { ja: 'naem' }
                            }
                        }
                    }
                },
                result: {
                    updTmpReserveSeatArgs: {
                        theaterCode: '118'
                    },
                    updTmpReserveSeatResult: {
                        tmpReserveNum: 12345,
                        listTmpReserve: []
                    },
                    price: 1234
                },
                endDate: moment().add(-1, 'minute').toDate(),
                purpose: {}
            }
        ];
        // const event = {
        //     // tslint:disable-next-line:no-magic-numbers
        //     startDate: moment().add(24, 'hours').toDate(),
        //     // tslint:disable-next-line:no-magic-numbers
        //     endDate: moment().add(25, 'hours').toDate(),
        //     workPerformed: { name: 'workPerformedName' },
        //     location: { name: { ja: 'eventLocationName' } }
        // };
        // const eventReservations: sskts.factory.reservation.event.IEventReservation<any>[] = [
        //     {
        //         typeOf: sskts.factory.reservationType.EventReservation,
        //         reservationFor: event,
        //         reservedTicket: {
        //             dateIssued: new Date(),
        //             typeOf: 'Ticket',
        //             ticketToken: 'ticketToken1',
        //             ticketNumber: 'ticketNumber1',
        //             underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
        //             coaTicketInfo: <any>{
        //                 ticketName: 'ticketName1',
        //                 salePrice: 234
        //             },
        //             issuedBy: <any>{},
        //             totalPrice: 234,
        //             priceCurrency: sskts.factory.priceCurrency.JPY,
        //             ticketedSeat: <any>{
        //                 seatNumber: 'seatNumber1'
        //             }
        //         },
        //         underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
        //         price: 234,
        //         additionalTicketText: '',
        //         modifiedTime: new Date(),
        //         numSeats: 1,
        //         priceCurrency: sskts.factory.priceCurrency.JPY,
        //         reservationNumber: 'reservationNumber',
        //         reservationStatus: sskts.factory.reservationStatusType.ReservationConfirmed

        //     },
        //     {
        //         typeOf: sskts.factory.reservationType.EventReservation,
        //         reservationFor: event,
        //         reservedTicket: {
        //             dateIssued: new Date(),
        //             typeOf: 'Ticket',
        //             ticketToken: 'ticketToken2',
        //             ticketNumber: 'ticketNumber2',
        //             underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
        //             coaTicketInfo: <any>{
        //                 ticketName: 'ticketName2',
        //                 salePrice: 1000
        //             },
        //             issuedBy: <any>{},
        //             totalPrice: 1000,
        //             priceCurrency: sskts.factory.priceCurrency.JPY,
        //             ticketedSeat: <any>{
        //                 seatNumber: 'seatNumber2'
        //             }
        //         },
        //         underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
        //         price: 1000,
        //         additionalTicketText: '',
        //         modifiedTime: new Date(),
        //         numSeats: 1,
        //         priceCurrency: sskts.factory.priceCurrency.JPY,
        //         reservationNumber: 'reservationNumber',
        //         reservationStatus: sskts.factory.reservationStatusType.ReservationConfirmed
        //     }
        // ];

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const orderNumberRepo = new sskts.repository.OrderNumber(redis.createClient());
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);

        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(orderNumberRepo).expects('publish').once().resolves('orderNumber');
        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(actionRepo).expects('findAuthorizeByTransactionId').once()
            .withExactArgs(transaction.id).resolves([
                ...creditCardAuthorizeActions,
                ...seatReservationAuthorizeActions
                // ...pecorinoAuthorizeActions
            ]);
        sandbox.mock(transactionRepo).expects('confirmPlaceOrder').once().withArgs(transaction.id).resolves();

        const result = await sskts.service.transaction.placeOrderInProgress.confirm({
            agentId: agent.id,
            transactionId: transaction.id,
            orderDate: new Date()
        })({
            action: actionRepo,
            transaction: transactionRepo,
            orderNumber: orderNumberRepo,
            organization: organizationRepo
        });
        assert.deepEqual(typeof result.orderNumber, 'string');
        sandbox.verify();
    });

    // tslint:disable-next-line:max-func-body-length
    it('ムビチケで確定できるはず', async () => {
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId',
            url: ''
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: 'sellerName',
            url: '',
            telephone: '0312345678',
            location: {}
        };
        const customerContact = {
            familyName: 'familyName',
            givenName: 'givenName',
            telephone: '+819012345678',
            email: 'test@example.com'
        };
        const transaction = {
            typeOf: sskts.factory.transactionType.PlaceOrder,
            id: 'transactionId',
            status: sskts.factory.transactionStatusType.InProgress,
            // tslint:disable-next-line:no-magic-numbers
            expires: moment().add(10, 'minutes').toDate(),
            tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported,
            agent: agent,
            seller: seller,
            object: {
                customerContact: customerContact,
                clientUser: <any>{ client_id: 'client_id' },
                authorizeActions: []
            }
        };
        const mvtkAuthorizeActions = [
            {
                id: 'actionId',
                actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                agent: transaction.agent,
                object: {
                    typeOf: sskts.factory.action.authorize.discount.mvtk.ObjectType.Mvtk,
                    seatInfoSyncIn: {
                        knyknrNoInfo: [
                            { knyknrNo: 'knyknrNo' }
                        ]
                    }
                },
                result: {
                    price: 1234
                },
                endDate: moment().add(-1, 'minute').toDate(),
                purpose: {}
            }
        ];
        const seatReservationAuthorizeActions = [
            {
                id: 'actionId1',
                actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                agent: transaction.seller,
                object: {
                    typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation,
                    offers: [],
                    individualScreeningEvent: {
                        superEvent: {
                            location: {
                                typeOf: 'MovieTheater',
                                name: { ja: 'naem' }
                            }
                        }
                    }
                },
                result: {
                    updTmpReserveSeatArgs: {
                        theaterCode: '118'
                    },
                    updTmpReserveSeatResult: {
                        tmpReserveNum: 12345,
                        listTmpReserve: []
                    },
                    price: 1234
                },
                endDate: moment().add(-1, 'minute').toDate(),
                purpose: {}
            }
        ];
        // const event = {
        //     // tslint:disable-next-line:no-magic-numbers
        //     startDate: moment().add(24, 'hours').toDate(),
        //     // tslint:disable-next-line:no-magic-numbers
        //     endDate: moment().add(25, 'hours').toDate(),
        //     workPerformed: { name: 'workPerformedName' },
        //     location: { name: { ja: 'eventLocationName' } }
        // };
        // const eventReservations: sskts.factory.reservation.event.IEventReservation<any>[] = [
        //     {
        //         typeOf: sskts.factory.reservationType.EventReservation,
        //         reservationFor: event,
        //         reservedTicket: {
        //             dateIssued: new Date(),
        //             typeOf: 'Ticket',
        //             ticketToken: 'ticketToken1',
        //             ticketNumber: 'ticketNumber1',
        //             underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
        //             coaTicketInfo: <any>{
        //                 ticketName: 'ticketName1',
        //                 salePrice: 234
        //             },
        //             issuedBy: <any>{},
        //             totalPrice: 234,
        //             priceCurrency: sskts.factory.priceCurrency.JPY,
        //             ticketedSeat: <any>{
        //                 seatNumber: 'seatNumber1'
        //             }
        //         },
        //         underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
        //         price: 234,
        //         additionalTicketText: '',
        //         modifiedTime: new Date(),
        //         numSeats: 1,
        //         priceCurrency: sskts.factory.priceCurrency.JPY,
        //         reservationNumber: 'reservationNumber',
        //         reservationStatus: sskts.factory.reservationStatusType.ReservationConfirmed

        //     },
        //     {
        //         typeOf: sskts.factory.reservationType.EventReservation,
        //         reservationFor: event,
        //         reservedTicket: {
        //             dateIssued: new Date(),
        //             typeOf: 'Ticket',
        //             ticketToken: 'ticketToken2',
        //             ticketNumber: 'ticketNumber2',
        //             underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
        //             coaTicketInfo: <any>{
        //                 ticketName: 'ticketName2',
        //                 salePrice: 1000
        //             },
        //             issuedBy: <any>{},
        //             totalPrice: 1000,
        //             priceCurrency: sskts.factory.priceCurrency.JPY,
        //             ticketedSeat: <any>{
        //                 seatNumber: 'seatNumber2'
        //             }
        //         },
        //         underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
        //         price: 1000,
        //         additionalTicketText: '',
        //         modifiedTime: new Date(),
        //         numSeats: 1,
        //         priceCurrency: sskts.factory.priceCurrency.JPY,
        //         reservationNumber: 'reservationNumber',
        //         reservationStatus: sskts.factory.reservationStatusType.ReservationConfirmed
        //     }
        // ];

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const orderNumberRepo = new sskts.repository.OrderNumber(redis.createClient());
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);

        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(orderNumberRepo).expects('publish').once().resolves('orderNumber');
        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(actionRepo).expects('findAuthorizeByTransactionId').once()
            .withExactArgs(transaction.id).resolves([...mvtkAuthorizeActions, ...seatReservationAuthorizeActions]);
        sandbox.mock(transactionRepo).expects('confirmPlaceOrder').once().withArgs(transaction.id).resolves();

        const result = await sskts.service.transaction.placeOrderInProgress.confirm({
            agentId: agent.id,
            transactionId: transaction.id,
            orderDate: new Date()
        })({
            action: actionRepo,
            transaction: transactionRepo,
            orderNumber: orderNumberRepo,
            organization: organizationRepo
        });
        assert.deepEqual(typeof result.orderNumber, 'string');
        sandbox.verify();
    });

    it('購入者連絡先がなければArgumentFoundエラーとなるはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            telephone: '0312345678'
        };
        const transaction = {
            id: 'transactionId',
            agent: agent,
            seller: seller,
            object: {
            }
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const orderNumberRepo = new sskts.repository.OrderNumber(redis.createClient());
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);

        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(orderNumberRepo).expects('publish').never();
        sandbox.mock(actionRepo).expects('findAuthorizeByTransactionId').never();

        const result = await sskts.service.transaction.placeOrderInProgress.confirm({
            agentId: agent.id,
            transactionId: transaction.id,
            orderDate: new Date()
        })({
            action: actionRepo,
            transaction: transactionRepo,
            orderNumber: orderNumberRepo,
            organization: organizationRepo
        })
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });

    it('確定条件が整っていなければ、Argumentエラーになるはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            telephone: '0312345678'
        };
        const transaction = {
            id: 'transactionId',
            agent: agent,
            seller: seller,
            object: {
                customerContact: {}
            }
        };
        const authorizeActions = [
            {
                id: 'actionId1',
                actionStatus: 'CompletedActionStatus',
                agent: transaction.seller,
                object: {
                    typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation,
                    offers: []
                },
                result: {
                    updTmpReserveSeatArgs: {},
                    price: 1234
                },
                endDate: new Date(),
                purpose: { typeOf: sskts.factory.transactionType.PlaceOrder }
            },
            {
                id: 'actionId2',
                actionStatus: 'CompletedActionStatus',
                agent: transaction.agent,
                object: {
                    typeOf: sskts.factory.action.authorize.paymentMethod.creditCard.ObjectType.CreditCard,
                    offers: []
                },
                result: {
                    price: 1235
                },
                endDate: new Date(),
                purpose: { typeOf: sskts.factory.transactionType.PlaceOrder }
            }
        ];

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const orderNumberRepo = new sskts.repository.OrderNumber(redis.createClient());
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);

        sandbox.mock(organizationRepo).expects('findById').once().resolves(seller);
        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(actionRepo).expects('findAuthorizeByTransactionId').once()
            .withExactArgs(transaction.id).resolves(authorizeActions);
        sandbox.mock(orderNumberRepo).expects('publish').never();
        sandbox.mock(transactionRepo).expects('confirmPlaceOrder').never();

        const result = await sskts.service.transaction.placeOrderInProgress.confirm({
            agentId: agent.id,
            transactionId: transaction.id,
            orderDate: new Date()
        })({
            action: actionRepo,
            transaction: transactionRepo,
            orderNumber: orderNumberRepo,
            organization: organizationRepo
        }).catch((err) => err);
        assert(result instanceof sskts.factory.errors.Argument);
        sandbox.verify();
    });

    it('所有者の取引でなければ、Forbiddenエラーが投げられるはず', async () => {
        const agent = {
            id: 'agentId'
        };
        const seller = {
            id: 'sellerId',
            name: { ja: 'ja', en: 'ne' },
            telephone: '0312345678'
        };
        const transaction = {
            id: 'transactionId',
            agent: { id: 'anotherAgentId' },
            seller: seller,
            object: {
            }
        };

        const actionRepo = new sskts.repository.Action(sskts.mongoose.connection);
        const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);
        const orderNumberRepo = new sskts.repository.OrderNumber(redis.createClient());
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);

        sandbox.mock(organizationRepo).expects('findById').never();
        sandbox.mock(transactionRepo).expects('findInProgressById').once().resolves(transaction);
        sandbox.mock(actionRepo).expects('findAuthorizeByTransactionId').never();
        sandbox.mock(orderNumberRepo).expects('publish').never();
        sandbox.mock(transactionRepo).expects('confirmPlaceOrder').never();

        const result = await sskts.service.transaction.placeOrderInProgress.confirm({
            agentId: agent.id,
            transactionId: transaction.id,
            orderDate: new Date()
        })({
            action: actionRepo,
            transaction: transactionRepo,
            orderNumber: orderNumberRepo,
            organization: organizationRepo
        })
            .catch((err) => err);

        assert(result instanceof sskts.factory.errors.Forbidden);
        sandbox.verify();
    });
});

describe('createEmailMessageFromTransaction()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    // tslint:disable-next-line:max-func-body-length
    it('確定条件が整っていれば、Eメールを作成できるはず', async () => {
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId',
            url: ''
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: { ja: 'sellerName', en: '' },
            url: '',
            telephone: '0312345678'
        };
        const customerContact = {
            familyName: 'familyName',
            givenName: 'givenName',
            telephone: '+819012345678',
            email: 'test@example.com'
        };
        const transaction = {
            typeOf: <sskts.factory.transactionType.PlaceOrder>sskts.factory.transactionType.PlaceOrder,
            id: 'transactionId',
            status: sskts.factory.transactionStatusType.InProgress,
            // tslint:disable-next-line:no-magic-numbers
            expires: moment().add(10, 'minutes').toDate(),
            tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported,
            agent: agent,
            seller: seller,
            object: {
                customerContact: customerContact,
                clientUser: <any>{ client_id: 'client_id' },
                authorizeActions: [],
                passportToken: 'passportToken',
                passport: <any>{}
            }
        };
        const creditCardAuthorizeActions = [
            {
                id: 'actionId2',
                actionStatus: 'CompletedActionStatus',
                agent: transaction.agent,
                object: {
                    typeOf: sskts.factory.action.authorize.paymentMethod.creditCard.ObjectType.CreditCard
                },
                result: {
                    execTranResult: {
                        orderId: 'orderId'
                    },
                    price: 1234
                },
                endDate: new Date(),
                purpose: {}
            }
        ];
        const seatReservationAuthorizeActions = [
            {
                id: 'actionId1',
                actionStatus: 'CompletedActionStatus',
                agent: transaction.seller,
                object: {
                    typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation,
                    individualScreeningEvent: {
                        superEvent: {
                            location: {
                                typeOf: 'MovieTheater',
                                name: { ja: 'naem' }
                            }
                        }
                    }
                },
                result: {
                    updTmpReserveSeatArgs: {
                        theaterCode: '118'
                    },
                    updTmpReserveSeatResult: {
                        tmpReserveNum: 12345
                    },
                    price: 1234
                },
                endDate: new Date(),
                purpose: {}
            }
        ];
        const event = {
            // tslint:disable-next-line:no-magic-numbers
            startDate: moment().add(24, 'hours').toDate(),
            // tslint:disable-next-line:no-magic-numbers
            endDate: moment().add(25, 'hours').toDate(),
            workPerformed: { name: 'workPerformedName' },
            location: { name: { ja: 'eventLocationName' } }
        };
        const eventReservations: sskts.factory.reservation.event.IEventReservation<any>[] = [
            {
                id: '',
                checkedIn: false,
                attended: false,
                typeOf: sskts.factory.reservationType.EventReservation,
                reservationFor: event,
                reservedTicket: {
                    dateIssued: new Date(),
                    typeOf: 'Ticket',
                    ticketToken: 'ticketToken1',
                    ticketNumber: 'ticketNumber1',
                    underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
                    coaTicketInfo: <any>{
                        ticketName: 'ticketName1',
                        salePrice: 234
                    },
                    issuedBy: <any>{},
                    totalPrice: 234,
                    priceCurrency: sskts.factory.priceCurrency.JPY,
                    ticketedSeat: <any>{
                        seatNumber: 'seatNumber1'
                    },
                    ticketType: <any>{}
                },
                underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
                price: 234,
                additionalTicketText: '',
                modifiedTime: new Date(),
                numSeats: 1,
                priceCurrency: sskts.factory.priceCurrency.JPY,
                reservationNumber: 'reservationNumber',
                reservationStatus: sskts.factory.reservationStatusType.ReservationConfirmed

            },
            {
                id: '',
                checkedIn: false,
                attended: false,
                typeOf: sskts.factory.reservationType.EventReservation,
                reservationFor: event,
                reservedTicket: {
                    dateIssued: new Date(),
                    typeOf: 'Ticket',
                    ticketToken: 'ticketToken2',
                    ticketNumber: 'ticketNumber2',
                    underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
                    coaTicketInfo: <any>{
                        ticketName: 'ticketName2',
                        salePrice: 1000
                    },
                    issuedBy: <any>{},
                    totalPrice: 1000,
                    priceCurrency: sskts.factory.priceCurrency.JPY,
                    ticketedSeat: <any>{
                        seatNumber: 'seatNumber2'
                    },
                    ticketType: <any>{}
                },
                underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
                price: 1000,
                additionalTicketText: '',
                modifiedTime: new Date(),
                numSeats: 1,
                priceCurrency: sskts.factory.priceCurrency.JPY,
                reservationNumber: 'reservationNumber',
                reservationStatus: sskts.factory.reservationStatusType.ReservationConfirmed
            }
        ];
        // tslint:disable-next-line:no-magic-numbers
        const orderDate = moment().add(10, 'seconds').toDate();
        const order = {
            orderNumber: `${moment(orderDate).tz('Asia/Tokyo').format('YYMMDD')}-118-12345`,
            orderDate: orderDate,
            orderStatus: sskts.factory.orderStatus.OrderProcessing,
            confirmationNumber: 12345,
            orderInquiryKey: {
                confirmationNumber: 12345,
                telephone: customerContact.telephone,
                theaterCode: '118'
            },
            isGift: false,
            acceptedOffers: eventReservations.map((r) => {
                return {
                    typeOf: <sskts.factory.offer.OfferType>'Offer',
                    itemOffered: r,
                    price: r.price,
                    priceCurrency: sskts.factory.priceCurrency.JPY,
                    seller: {
                        typeOf: sskts.factory.organizationType.MovieTheater,
                        name: seatReservationAuthorizeActions[0].object.individualScreeningEvent.superEvent.location.name.ja
                    }
                };
            }),
            customer: {
                ...customerContact,
                id: transaction.agent.id,
                typeOf: transaction.agent.typeOf,
                name: `${transaction.object.customerContact.familyName} ${transaction.object.customerContact.givenName}`,
                url: ''
            },
            paymentMethods: [{
                name: 'クレジットカード',
                typeOf: sskts.factory.paymentMethodType.CreditCard,
                paymentMethodId: creditCardAuthorizeActions[0].result.execTranResult.orderId,
                additionalProperty: []
            }],
            discounts: [],
            price: 1234,
            priceCurrency: sskts.factory.priceCurrency.JPY,
            seller: {
                id: transaction.seller.id,
                typeOf: transaction.seller.typeOf,
                name: transaction.seller.name.ja,
                url: ''
            },
            typeOf: <sskts.factory.order.TypeOf>'Order',
            // tslint:disable-next-line:max-line-length
            url: `${process.env.ORDER_INQUIRY_ENDPOINT}/inquiry/login?theater=${seatReservationAuthorizeActions[0].result.updTmpReserveSeatArgs.theaterCode}&reserve=${seatReservationAuthorizeActions[0].result.updTmpReserveSeatResult.tmpReserveNum}`
        };

        const result = await sskts.service.transaction.placeOrderInProgress.createEmailMessageFromTransaction({
            transaction: transaction,
            customerContact: customerContact,
            order: order,
            seller: <any>seller
        });

        assert.equal(typeof result, 'object');
        sandbox.verify();
    });
});

describe('createOrderFromTransaction()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    // tslint:disable-next-line:max-func-body-length
    it('取引オブジェクトから注文オブジェクトを生成できるはず', async () => {
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId',
            url: '',
            memberOf: {
                typeOf: <sskts.factory.programMembership.ProgramMembershipType>'ProgramMembership',
                programName: 'programName',
                membershipNumber: 'membershipNumber',
                award: []
            }
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: { ja: 'sellerName', en: '' },
            url: '',
            telephone: '0312345678'
        };
        const customerContact = {
            familyName: 'familyName',
            givenName: 'givenName',
            telephone: '+819012345678',
            email: 'test@example.com'
        };
        const transaction = {
            typeOf: <sskts.factory.transactionType.PlaceOrder>sskts.factory.transactionType.PlaceOrder,
            id: 'transactionId',
            status: sskts.factory.transactionStatusType.InProgress,
            // tslint:disable-next-line:no-magic-numbers
            expires: moment().add(10, 'minutes').toDate(),
            tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported,
            agent: agent,
            seller: seller,
            object: {
                passportToken: 'passportToken',
                passport: <any>{},
                customerContact: customerContact,
                clientUser: <any>{ client_id: 'client_id' },
                authorizeActions: [
                    {
                        typeOf: <sskts.factory.actionType.AuthorizeAction>sskts.factory.actionType.AuthorizeAction,
                        id: 'actionId2',
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        agent: agent,
                        recipient: seller,
                        object: {
                            typeOf: sskts.factory.action.authorize.paymentMethod.creditCard.ObjectType.CreditCard
                        },
                        result: {
                            execTranResult: {
                                orderId: 'orderId'
                            },
                            price: 234
                        },
                        startDate: new Date(),
                        endDate: new Date(),
                        purpose: {}
                    },
                    {
                        typeOf: <sskts.factory.actionType.AuthorizeAction>sskts.factory.actionType.AuthorizeAction,
                        id: 'actionId2',
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        agent: agent,
                        recipient: seller,
                        object: {
                            typeOf: sskts.factory.action.authorize.discount.mvtk.ObjectType.Mvtk,
                            seatInfoSyncIn: {
                                knyknrNoInfo: [
                                    { knyknrNo: 'knyknrNo' }
                                ]
                            }
                        },
                        result: {
                            price: 1000
                        },
                        startDate: new Date(),
                        endDate: new Date(),
                        purpose: {}
                    },
                    {
                        typeOf: <sskts.factory.actionType.AuthorizeAction>sskts.factory.actionType.AuthorizeAction,
                        id: 'actionId1',
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        agent: seller,
                        recipient: agent,
                        object: {
                            typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation,
                            individualScreeningEvent: {
                                superEvent: {
                                    location: {
                                        typeOf: 'MovieTheater',
                                        name: { ja: 'name' }
                                    }
                                }
                            }
                        },
                        result: {
                            updTmpReserveSeatArgs: {
                                theaterCode: '118'
                            },
                            updTmpReserveSeatResult: {
                                tmpReserveNum: 12345,
                                listTmpReserve: []
                            },
                            price: 1234
                        },
                        startDate: new Date(),
                        endDate: new Date(),
                        purpose: {}
                    }
                ]
            }
        };
        // tslint:disable-next-line:no-magic-numbers
        const orderDate = moment().add(10, 'seconds').toDate();
        const orderStatus = sskts.factory.orderStatus.OrderProcessing;

        // const event = {
        //     // tslint:disable-next-line:no-magic-numbers
        //     startDate: moment().add(24, 'hours').toDate(),
        //     // tslint:disable-next-line:no-magic-numbers
        //     endDate: moment().add(25, 'hours').toDate(),
        //     workPerformed: { name: 'workPerformedName' },
        //     location: { name: { ja: 'eventLocationName' } }
        // };
        // const eventReservations: sskts.factory.reservation.event.IEventReservation<any>[] = [
        //     {
        //         typeOf: sskts.factory.reservationType.EventReservation,
        //         reservationFor: event,
        //         reservedTicket: {
        //             dateIssued: new Date(),
        //             typeOf: 'Ticket',
        //             ticketToken: 'ticketToken1',
        //             ticketNumber: 'ticketNumber1',
        //             underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
        //             coaTicketInfo: <any>{
        //                 ticketName: 'ticketName1',
        //                 salePrice: 234
        //             },
        //             issuedBy: <any>{},
        //             totalPrice: 234,
        //             priceCurrency: sskts.factory.priceCurrency.JPY,
        //             ticketedSeat: <any>{
        //                 seatNumber: 'seatNumber1'
        //             }
        //         },
        //         underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
        //         price: 234,
        //         additionalTicketText: '',
        //         modifiedTime: new Date(),
        //         numSeats: 1,
        //         priceCurrency: sskts.factory.priceCurrency.JPY,
        //         reservationNumber: 'reservationNumber',
        //         reservationStatus: sskts.factory.reservationStatusType.ReservationConfirmed

        //     },
        //     {
        //         typeOf: sskts.factory.reservationType.EventReservation,
        //         reservationFor: event,
        //         reservedTicket: {
        //             dateIssued: new Date(),
        //             typeOf: 'Ticket',
        //             ticketToken: 'ticketToken2',
        //             ticketNumber: 'ticketNumber2',
        //             underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
        //             coaTicketInfo: <any>{
        //                 ticketName: 'ticketName2',
        //                 salePrice: 1000
        //             },
        //             issuedBy: <any>{},
        //             totalPrice: 1000,
        //             priceCurrency: sskts.factory.priceCurrency.JPY,
        //             ticketedSeat: <any>{
        //                 seatNumber: 'seatNumber2'
        //             }
        //         },
        //         underName: { typeOf: sskts.factory.personType.Person, name: <any>{} },
        //         price: 1000,
        //         additionalTicketText: '',
        //         modifiedTime: new Date(),
        //         numSeats: 1,
        //         priceCurrency: sskts.factory.priceCurrency.JPY,
        //         reservationNumber: 'reservationNumber',
        //         reservationStatus: sskts.factory.reservationStatusType.ReservationConfirmed
        //     }
        // ];

        const result = sskts.service.transaction.placeOrderInProgress.createOrderFromTransaction({
            transaction: transaction,
            orderNumber: 'orderNumber',
            orderDate: orderDate,
            orderStatus: orderStatus,
            isGift: false,
            seller: <any>{ location: { branchCode: '000' } }
        });

        assert(typeof result, 'object');
        sandbox.verify();
    });

    // tslint:disable-next-line:max-func-body-length
    it('座席予約承認アクションがなければArgumentエラー', async () => {
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId',
            url: '',
            memberOf: {
                typeOf: <sskts.factory.programMembership.ProgramMembershipType>'ProgramMembership',
                programName: 'programName',
                membershipNumber: 'membershipNumber',
                award: []
            }
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: { ja: 'sellerName', en: '' },
            url: '',
            telephone: '0312345678'
        };
        const customerContact = {
            familyName: 'familyName',
            givenName: 'givenName',
            telephone: '+819012345678',
            email: 'test@example.com'
        };
        const transaction = {
            typeOf: <sskts.factory.transactionType.PlaceOrder>sskts.factory.transactionType.PlaceOrder,
            id: 'transactionId',
            status: sskts.factory.transactionStatusType.InProgress,
            // tslint:disable-next-line:no-magic-numbers
            expires: moment().add(10, 'minutes').toDate(),
            tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported,
            agent: agent,
            seller: seller,
            object: {
                passportToken: 'passportToken',
                passport: <any>{},
                customerContact: customerContact,
                clientUser: <any>{ client_id: 'client_id' },
                authorizeActions: [
                    <any>{
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        id: 'actionId',
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        agent: seller,
                        recipient: agent,
                        object: {
                            typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation
                        },
                        result: {},
                        startDate: new Date(),
                        endDate: new Date()
                    },
                    <any>{
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        id: 'actionId',
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        agent: seller,
                        recipient: agent,
                        object: {
                            typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation
                        },
                        result: {},
                        startDate: new Date(),
                        endDate: new Date()
                    }
                ]
            }
        };
        // tslint:disable-next-line:no-magic-numbers
        const orderDate = moment().add(10, 'seconds').toDate();
        const orderStatus = sskts.factory.orderStatus.OrderProcessing;

        assert.throws(
            () => {
                sskts.service.transaction.placeOrderInProgress.createOrderFromTransaction({
                    transaction: transaction,
                    orderNumber: 'orderNumber',
                    orderDate: orderDate,
                    orderStatus: orderStatus,
                    isGift: false,
                    seller: <any>{ location: { branchCode: '000' } }
                });
            },
            (err: any) => {
                assert(err instanceof sskts.factory.errors.NotImplemented);
                sandbox.verify();

                return true;
            }
        );
    });

    // tslint:disable-next-line:max-func-body-length
    // it('座席予約承認アクションが2つであればNotImplementedエラー', async () => {
    //     const agent = {
    //         typeOf: sskts.factory.personType.Person,
    //         id: 'agentId',
    //         url: '',
    //         memberOf: {
    //             typeOf: <sskts.factory.programMembership.ProgramMembershipType>'ProgramMembership',
    //             programName: 'programName',
    //             membershipNumber: 'membershipNumber',
    //             award: []
    //         }
    //     };
    //     const seller = {
    //         typeOf: sskts.factory.organizationType.MovieTheater,
    //         id: 'sellerId',
    //         name: { ja: 'sellerName', en: '' },
    //         url: '',
    //         telephone: '0312345678'
    //     };
    //     const customerContact = {
    //         familyName: 'familyName',
    //         givenName: 'givenName',
    //         telephone: '+819012345678',
    //         email: 'test@example.com'
    //     };
    //     const transaction = {
    //         typeOf: sskts.factory.transactionType.PlaceOrder,
    //         id: 'transactionId',
    //         status: sskts.factory.transactionStatusType.InProgress,
    //         // tslint:disable-next-line:no-magic-numbers
    //         expires: moment().add(10, 'minutes').toDate(),
    //         tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported,
    //         agent: agent,
    //         seller: seller,
    //         object: {
    //             passportToken: 'passportToken',
    //             passport: <any>{},
    //             customerContact: customerContact,
    //             clientUser: <any>{ client_id: 'client_id' },
    //             authorizeActions: [
    //             ]
    //         }
    //     };
    //     // tslint:disable-next-line:no-magic-numbers
    //     const orderDate = moment().add(10, 'seconds').toDate();
    //     const orderStatus = sskts.factory.orderStatus.OrderProcessing;

    //     assert.throws(
    //         () => {
    //             sskts.service.transaction.placeOrderInProgress.createOrderFromTransaction({
    //                 transaction: transaction,
    //                 orderDate: orderDate,
    //                 orderStatus: orderStatus,
    //                 isGift: false,
    //                 seller: <any>{ location: { branchCode: '000' } }
    //             });
    //         },
    //         (err: any) => {
    //             assert(err instanceof sskts.factory.errors.Argument);
    //             sandbox.verify();

    //             return true;
    //         }
    //     );
    // });

    // tslint:disable-next-line:max-func-body-length
    it('座席予約承認アクションのresultがなければArgumentエラー', async () => {
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId',
            url: '',
            memberOf: {
                typeOf: <sskts.factory.programMembership.ProgramMembershipType>'ProgramMembership',
                programName: 'programName',
                membershipNumber: 'membershipNumber',
                award: []
            }
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: { ja: 'sellerName', en: '' },
            url: '',
            telephone: '0312345678'
        };
        const customerContact = {
            familyName: 'familyName',
            givenName: 'givenName',
            telephone: '+819012345678',
            email: 'test@example.com'
        };
        const transaction = {
            typeOf: <sskts.factory.transactionType.PlaceOrder>sskts.factory.transactionType.PlaceOrder,
            id: 'transactionId',
            status: sskts.factory.transactionStatusType.InProgress,
            // tslint:disable-next-line:no-magic-numbers
            expires: moment().add(10, 'minutes').toDate(),
            tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported,
            agent: agent,
            seller: seller,
            object: {
                passportToken: 'passportToken',
                passport: <any>{},
                customerContact: customerContact,
                clientUser: <any>{ client_id: 'client_id' },
                authorizeActions: [
                    <any>{
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        id: 'actionId',
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        agent: seller,
                        recipient: agent,
                        object: {
                            typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation
                        },
                        startDate: new Date(),
                        endDate: new Date()
                    }
                ]
            }
        };
        // tslint:disable-next-line:no-magic-numbers
        const orderDate = moment().add(10, 'seconds').toDate();
        const orderStatus = sskts.factory.orderStatus.OrderProcessing;

        assert.throws(
            () => {
                sskts.service.transaction.placeOrderInProgress.createOrderFromTransaction({
                    transaction: transaction,
                    orderNumber: 'orderNumber',
                    orderDate: orderDate,
                    orderStatus: orderStatus,
                    isGift: false,
                    seller: <any>{ location: { branchCode: '000' } }
                });
            },
            (err: any) => {
                assert(err instanceof sskts.factory.errors.Argument);
                sandbox.verify();

                return true;
            }
        );
    });

    // tslint:disable-next-line:max-func-body-length
    it('購入者連絡先がなければArgumentエラー', async () => {
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId',
            url: '',
            memberOf: {
                typeOf: <sskts.factory.programMembership.ProgramMembershipType>'ProgramMembership',
                programName: 'programName',
                membershipNumber: 'membershipNumber',
                award: []
            }
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: { ja: 'sellerName', en: '' },
            url: '',
            telephone: '0312345678'
        };
        const transaction = {
            typeOf: <sskts.factory.transactionType.PlaceOrder>sskts.factory.transactionType.PlaceOrder,
            id: 'transactionId',
            status: sskts.factory.transactionStatusType.InProgress,
            // tslint:disable-next-line:no-magic-numbers
            expires: moment().add(10, 'minutes').toDate(),
            tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported,
            agent: agent,
            seller: seller,
            object: {
                passportToken: 'passportToken',
                passport: <any>{},
                clientUser: <any>{ client_id: 'client_id' },
                authorizeActions: [
                    <any>{
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        id: 'actionId',
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        agent: seller,
                        recipient: agent,
                        object: {
                            typeOf: sskts.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation
                        },
                        result: {},
                        startDate: new Date(),
                        endDate: new Date()
                    }
                ]
            }
        };
        // tslint:disable-next-line:no-magic-numbers
        const orderDate = moment().add(10, 'seconds').toDate();
        const orderStatus = sskts.factory.orderStatus.OrderProcessing;

        assert.throws(
            () => {
                sskts.service.transaction.placeOrderInProgress.createOrderFromTransaction({
                    transaction: transaction,
                    orderNumber: 'orderNumber',
                    orderDate: orderDate,
                    orderStatus: orderStatus,
                    isGift: false,
                    seller: <any>{ location: { branchCode: '000' } }
                });
            },
            (err: any) => {
                assert(err instanceof sskts.factory.errors.Argument);
                sandbox.verify();

                return true;
            }
        );
    });
});

describe('validateTransaction()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('クレジットカードオーソリが2つ以上であればArgumentとなるはず', async () => {
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId',
            url: '',
            memberOf: {
                programName: 'programName',
                membershipNumber: 'membershipNumber'
            }
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: 'sellerName',
            url: '',
            telephone: '0312345678'
        };
        const customerContact = {
            familyName: 'familyName',
            givenName: 'givenName',
            telephone: '+819012345678',
            email: 'test@example.com'
        };
        const transaction = {
            typeOf: sskts.factory.transactionType.PlaceOrder,
            id: 'transactionId',
            status: sskts.factory.transactionStatusType.InProgress,
            // tslint:disable-next-line:no-magic-numbers
            expires: moment().add(10, 'minutes').toDate(),
            tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported,
            agent: agent,
            seller: seller,
            object: {
                passportToken: 'passportToken',
                passport: <any>{},
                customerContact: customerContact,
                clientUser: <any>{ client_id: 'client_id' },
                authorizeActions: [
                    {
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        id: 'actionId',
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        agent: agent,
                        recipient: seller,
                        object: {
                            typeOf: sskts.factory.action.authorize.paymentMethod.creditCard.ObjectType.CreditCard
                        },
                        startDate: new Date(),
                        endDate: new Date()
                    },
                    {
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        id: 'actionId',
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        agent: agent,
                        recipient: seller,
                        object: {
                            typeOf: sskts.factory.action.authorize.paymentMethod.creditCard.ObjectType.CreditCard
                        },
                        startDate: new Date(),
                        endDate: new Date()
                    }
                ]
            }
        };

        assert.throws(
            () => {
                sskts.service.transaction.placeOrderInProgress.validateTransaction(<any>transaction);
            },
            (err: any) => {
                assert(err instanceof sskts.factory.errors.Argument);
                sandbox.verify();

                return true;
            }
        );
    });

    it('ムビチケ承認アクションが2つ以上であればArgumentとなるはず', async () => {
        const agent = {
            typeOf: sskts.factory.personType.Person,
            id: 'agentId',
            url: '',
            memberOf: {
                programName: 'programName',
                membershipNumber: 'membershipNumber'
            }
        };
        const seller = {
            typeOf: sskts.factory.organizationType.MovieTheater,
            id: 'sellerId',
            name: 'sellerName',
            url: '',
            telephone: '0312345678'
        };
        const customerContact = {
            familyName: 'familyName',
            givenName: 'givenName',
            telephone: '+819012345678',
            email: 'test@example.com'
        };
        const transaction = {
            typeOf: sskts.factory.transactionType.PlaceOrder,
            id: 'transactionId',
            status: sskts.factory.transactionStatusType.InProgress,
            // tslint:disable-next-line:no-magic-numbers
            expires: moment().add(10, 'minutes').toDate(),
            tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported,
            agent: agent,
            seller: seller,
            object: {
                passportToken: 'passportToken',
                passport: <any>{},
                customerContact: customerContact,
                clientUser: <any>{ client_id: 'client_id' },
                authorizeActions: [
                    {
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        id: 'actionId',
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        agent: agent,
                        recipient: seller,
                        object: {
                            typeOf: sskts.factory.action.authorize.discount.mvtk.ObjectType.Mvtk
                        },
                        startDate: new Date(),
                        endDate: new Date()
                    },
                    {
                        typeOf: sskts.factory.actionType.AuthorizeAction,
                        id: 'actionId',
                        actionStatus: sskts.factory.actionStatusType.CompletedActionStatus,
                        agent: agent,
                        recipient: seller,
                        object: {
                            typeOf: sskts.factory.action.authorize.discount.mvtk.ObjectType.Mvtk
                        },
                        startDate: new Date(),
                        endDate: new Date()
                    }
                ]
            }
        };

        assert.throws(
            () => {
                sskts.service.transaction.placeOrderInProgress.validateTransaction(<any>transaction);
            },
            (err: any) => {
                assert(err instanceof sskts.factory.errors.Argument);
                sandbox.verify();

                return true;
            }
        );
    });
});

// describe('createEmailMessageFromTransaction()', () => {
//     afterEach(() => {
//         sandbox.restore();
//     });

//     it('メール本文のレンダリングに失敗すればそのままエラーとなるはず', async () => {
//         const agent = {
//             typeOf: sskts.factory.personType.Person,
//             id: 'agentId',
//             url: ''
//         };
//         const seller = {
//             typeOf: sskts.factory.organizationType.MovieTheater,
//             id: 'sellerId',
//             name: 'sellerName',
//             url: '',
//             telephone: '0312345678'
//         };
//         const customerContact = {
//             familyName: 'familyName',
//             givenName: 'givenName',
//             telephone: '+819012345678',
//             email: 'test@example.com'
//         };
//         const transaction = {
//             typeOf: sskts.factory.transactionType.PlaceOrder,
//             id: 'transactionId',
//             status: sskts.factory.transactionStatusType.InProgress,
//             // tslint:disable-next-line:no-magic-numbers
//             expires: moment().add(10, 'minutes').toDate(),
//             tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported,
//             agent: agent,
//             seller: seller,
//             object: {}
//         };
//         // tslint:disable-next-line:no-magic-numbers
//         const orderDate = moment().add(10, 'seconds').toDate();
//         const sellerOrganization = {
//             id: 'sellerId',
//             typeOf: <sskts.factory.organizationType.MovieTheater>sskts.factory.organizationType.MovieTheater,
//             identifier: 'sellerIdentifier',
//             branchCode: 'branchCode',
//             name: {
//                 ja: 'ja',
//                 en: 'en'
//             },
//             legalName: <any>{},
//             location: <any>{},
//             parentOrganization: <any>{},
//             telephone: '0312345678',
//             url: 'https://example.com',
//             gmoInfo: <any>{}
//         };
//         const order = {
//             orderNumber: `${moment(orderDate).tz('Asia/Tokyo').format('YYMMDD')}-118-12345`,
//             orderDate: orderDate,
//             orderStatus: sskts.factory.orderStatus.OrderProcessing,
//             confirmationNumber: 12345,
//             orderInquiryKey: <any>{},
//             isGift: false,
//             acceptedOffers: [
//                 <any>{
//                     itemOffered: {
//                         reservedTicket: {
//                             ticketedSeat: {},
//                             coaTicketInfo: {}
//                         },
//                         reservationFor: {
//                             workPerformed: {},
//                             location: { name: {} }
//                         }
//                     }
//                 }
//             ],
//             customer: <any>{},
//             paymentMethods: [],
//             discounts: [],
//             price: 1234,
//             priceCurrency: sskts.factory.priceCurrency.JPY,
//             seller: transaction.seller,
//             typeOf: 'Order',
//             // tslint:disable-next-line:max-line-length
//             url: `${process.env.ORDER_INQUIRY_ENDPOINT}/inquiry/login?theater=theaterCode&reserve=tmpReserveNum`
//         };
//         const renderError = new Error('renderError');

//         // tslint:disable-next-line:no-magic-numbers
//         sandbox.mock(pug).expects('renderFile').once().callsArgWith(2, renderError);

//         const result = await sskts.service.transaction.placeOrderInProgress.createEmailMessageFromTransaction({
//             transaction: <any>transaction,
//             customerContact: customerContact,
//             order: order,
//             seller: sellerOrganization
//         }).catch((err) => err);

//         assert.deepEqual(result, renderError);
//         sandbox.verify();
//     });

//     it('メール件名のレンダリングに失敗すればそのままエラーとなるはず', async () => {
//         const agent = {
//             typeOf: sskts.factory.personType.Person,
//             id: 'agentId',
//             url: ''
//         };
//         const seller = {
//             typeOf: sskts.factory.organizationType.MovieTheater,
//             id: 'sellerId',
//             name: 'sellerName',
//             url: '',
//             telephone: '0312345678'
//         };
//         const customerContact = {
//             familyName: 'familyName',
//             givenName: 'givenName',
//             telephone: '+819012345678',
//             email: 'test@example.com'
//         };
//         const transaction = {
//             typeOf: sskts.factory.transactionType.PlaceOrder,
//             id: 'transactionId',
//             status: sskts.factory.transactionStatusType.InProgress,
//             // tslint:disable-next-line:no-magic-numbers
//             expires: moment().add(10, 'minutes').toDate(),
//             tasksExportationStatus: sskts.factory.transactionTasksExportationStatus.Unexported,
//             agent: agent,
//             seller: seller,
//             object: {}
//         };
//         // tslint:disable-next-line:no-magic-numbers
//         const orderDate = moment().add(10, 'seconds').toDate();
//         const sellerOrganization = {
//             id: 'sellerId',
//             typeOf: <sskts.factory.organizationType.MovieTheater>sskts.factory.organizationType.MovieTheater,
//             identifier: 'sellerIdentifier',
//             branchCode: 'branchCode',
//             name: {
//                 ja: 'ja',
//                 en: 'en'
//             },
//             legalName: <any>{},
//             location: <any>{},
//             parentOrganization: <any>{},
//             telephone: '0312345678',
//             url: 'https://example.com',
//             gmoInfo: <any>{}
//         };
//         const order = {
//             orderNumber: `${moment(orderDate).tz('Asia/Tokyo').format('YYMMDD')}-118-12345`,
//             orderDate: orderDate,
//             orderStatus: sskts.factory.orderStatus.OrderProcessing,
//             confirmationNumber: 12345,
//             orderInquiryKey: <any>{},
//             isGift: false,
//             acceptedOffers: [
//                 <any>{
//                     itemOffered: {
//                         reservedTicket: {
//                             ticketedSeat: {},
//                             coaTicketInfo: {}
//                         },
//                         reservationFor: {
//                             workPerformed: {},
//                             location: { name: {} }
//                         }
//                     }
//                 }
//             ],
//             customer: <any>{},
//             paymentMethods: [],
//             discounts: [],
//             price: 1234,
//             priceCurrency: sskts.factory.priceCurrency.JPY,
//             seller: transaction.seller,
//             typeOf: 'Order',
//             // tslint:disable-next-line:max-line-length
//             url: `${process.env.ORDER_INQUIRY_ENDPOINT}/inquiry/login?theater=theaterCode&reserve=tmpReserveNum`
//         };
//         const renderError = new Error('renderError');
//         const message = 'message body';

//         sandbox.mock(pug).expects('renderFile').twice()
//             // tslint:disable-next-line:no-magic-numbers
//             .onFirstCall().callsArgWith(2, null, message)
//             // tslint:disable-next-line:no-magic-numbers
//             .onSecondCall().callsArgWith(2, renderError);

//         const result = await sskts.service.transaction.placeOrderInProgress.createEmailMessageFromTransaction({
//             transaction: <any>transaction,
//             customerContact: customerContact,
//             order: order,
//             seller: sellerOrganization
//         }).catch((err) => err);

//         assert.deepEqual(result, renderError);
//         sandbox.verify();
//     });
// });
