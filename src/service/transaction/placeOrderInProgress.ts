/**
 * 進行中注文取引サービス
 */
import * as cinerino from '@cinerino/domain';

import * as createDebug from 'debug';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import * as moment from 'moment-timezone';
import * as pug from 'pug';
import * as util from 'util';

import { MongoRepository as ActionRepo } from '../../repo/action';
import { RedisRepository as OrderNumberRepo } from '../../repo/orderNumber';
import { MongoRepository as SellerRepo } from '../../repo/seller';
import { MongoRepository as TransactionRepo } from '../../repo/transaction';

import * as MvtkAuthorizeActionService from './placeOrderInProgress/action/authorize/discount/mvtk';
import * as ProgramMembershipAuthorizeActionService from './placeOrderInProgress/action/authorize/offer/programMembership';
import * as SeatReservationAuthorizeActionService from './placeOrderInProgress/action/authorize/offer/seatReservation';

import * as factory from '../../factory';

const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress');

export type IConfirmOperation<T> = (repos: {
    action: ActionRepo;
    transaction: TransactionRepo;
    orderNumber: OrderNumberRepo;
    seller: SellerRepo;
}) => Promise<T>;

export type IAuthorizeAnyPaymentResult = factory.action.authorize.paymentMethod.any.IResult<factory.paymentMethodType>;

export type ISeller = factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>;

/**
 * 取引に対するアクション
 */
export namespace action {
    /**
     * 取引に対する承認アクション
     */
    export namespace authorize {
        export import award = cinerino.service.transaction.placeOrderInProgress.action.authorize.award;
        export import paymentMethod = cinerino.service.transaction.placeOrderInProgress.action.authorize.paymentMethod;
        export namespace discount {
            /**
             * ムビチケ承認アクションサービス
             */
            export import mvtk = MvtkAuthorizeActionService;
        }
        export namespace offer {
            /**
             * 会員プログラム承認アクションサービス
             */
            export import programMembership = ProgramMembershipAuthorizeActionService;
            /**
             * 座席予約承認アクションサービス
             */
            export import seatReservation = SeatReservationAuthorizeActionService;
        }
    }
}

export import start = cinerino.service.transaction.placeOrderInProgress.start;
export import setCustomerContact = cinerino.service.transaction.placeOrderInProgress.setCustomerContact;
export import validateTransaction = cinerino.service.transaction.placeOrderInProgress.validateTransaction;

export type IOrderConfirmationNumberGenerator = (order: factory.order.IOrder) => number;
export type IOrderURLGenerator = (order: factory.order.IOrder) => string;
export interface IConfirmResultOrderParams {
    /**
     * 注文日時
     */
    orderDate: Date;
    /**
     * 確認番号のカスタム指定
     */
    confirmationNumber?: number | IOrderConfirmationNumberGenerator;
    /**
     * 注文確認URLのカスタム指定
     */
    url?: string | IOrderURLGenerator;
}
export interface IConfirmParams {
    /**
     * 取引ID
     */
    id: string;
    /**
     * 取引進行者
     */
    agent: { id: string };
    result: {
        order: IConfirmResultOrderParams;
    };
    options: {
        /**
         * 注文配送メールを送信するかどうか
         */
        sendEmailMessage?: boolean;
        /**
         * 注文配送メールテンプレート
         * メールをカスタマイズしたい場合、PUGテンプレートを指定
         * @see https://pugjs.org/api/getting-started.html
         */
        emailTemplate?: string;
    };
}

/**
 * 注文取引を確定する
 */
// tslint:disable-next-line:max-func-body-length
export function confirm(params: IConfirmParams): IConfirmOperation<factory.order.IOrder> {
    return async (repos: {
        action: ActionRepo;
        transaction: TransactionRepo;
        orderNumber: OrderNumberRepo;
        seller: SellerRepo;
    }) => {
        const transaction = await repos.transaction.findInProgressById({
            typeOf: factory.transactionType.PlaceOrder,
            id: params.id
        });
        if (transaction.agent.id !== params.agent.id) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        const seller = await repos.seller.findById({ id: transaction.seller.id });
        debug('seller found.', seller.identifier);

        // 取引に対する全ての承認アクションをマージ
        let authorizeActions = await repos.action.searchByPurpose({
            typeOf: factory.actionType.AuthorizeAction,
            purpose: {
                typeOf: factory.transactionType.PlaceOrder,
                id: params.id
            }
        });
        // 万が一このプロセス中に他処理が発生してもそれらを無視するように、endDateでフィルタリング
        authorizeActions = authorizeActions.filter((a) => (a.endDate !== undefined && a.endDate < params.result.order.orderDate));
        transaction.object.authorizeActions = authorizeActions;

        // 取引の確定条件が全て整っているかどうか確認
        validateTransaction(transaction);

        // 注文番号を発行
        const orderNumber = await repos.orderNumber.publish({
            orderDate: params.result.order.orderDate,
            sellerType: seller.typeOf,
            sellerBranchCode: (seller.location !== undefined && seller.location.branchCode !== undefined) ? seller.location.branchCode : ''
        });

        // 注文作成
        const order = createOrderFromTransaction({
            transaction: transaction,
            orderNumber: orderNumber,
            confirmationNumber: 0,
            orderDate: params.result.order.orderDate,
            orderStatus: factory.orderStatus.OrderProcessing,
            isGift: false,
            seller: seller
        });

        // 確認番号の指定があれば上書き
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (typeof params.result.order.confirmationNumber === 'number') {
            order.confirmationNumber = params.result.order.confirmationNumber;
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore if */
        } else if (typeof params.result.order.confirmationNumber === 'function') {
            order.confirmationNumber = params.result.order.confirmationNumber(order);
        }

        // URLの指定があれば上書き
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (typeof params.result.order.url === 'string') {
            order.url = params.result.order.url;
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore if */
        } else if (typeof params.result.order.url === 'function') {
            order.url = params.result.order.url(order);
        }

        const result: factory.transaction.placeOrder.IResult = { order };

        // ポストアクションを作成
        const potentialActions = await createPotentialActionsFromTransaction({
            transaction: transaction,
            order: order,
            seller: seller,
            sendEmailMessage: params.options.sendEmailMessage
        });

        // ステータス変更
        debug('finally confirming transaction...');
        await repos.transaction.confirmPlaceOrder({
            id: params.id,
            authorizeActions: authorizeActions,
            result: result,
            potentialActions: potentialActions
        });

        return order;
    };
}

export type IAuthorizeSeatReservationOfferResult =
    factory.action.authorize.offer.seatReservation.IResult<factory.service.webAPI.Identifier.COA>;
export type IAuthorizePointAccountPayment =
    factory.action.authorize.paymentMethod.account.IAccount<factory.accountType.Point>;
export type IAuthorizeActionResultBySeller =
    factory.action.authorize.offer.programMembership.IResult |
    IAuthorizeSeatReservationOfferResult |
    factory.action.authorize.award.point.IResult;

/**
 * 取引オブジェクトから注文オブジェクトを生成する
 */
// tslint:disable-next-line:max-func-body-length
export function createOrderFromTransaction(params: {
    transaction: factory.transaction.placeOrder.ITransaction;
    orderNumber: string;
    confirmationNumber: number;
    orderDate: Date;
    orderStatus: factory.orderStatus;
    isGift: boolean;
    seller: ISeller;
}): factory.order.IOrder {
    // 座席予約に対する承認アクション取り出す
    const seatReservationAuthorizeActions =
        <factory.action.authorize.offer.seatReservation.IAction<factory.service.webAPI.Identifier.COA>[]>
        params.transaction.object.authorizeActions
            .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
            .filter((a) => a.object.typeOf === factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation);
    if (seatReservationAuthorizeActions.length > 1) {
        throw new factory.errors.NotImplemented('Number of seat reservation authorizeAction must be 1.');
    }
    const seatReservationAuthorizeAction = seatReservationAuthorizeActions.shift();

    // 会員プログラムに対する承認アクションを取り出す
    const programMembershipAuthorizeActions = params.transaction.object.authorizeActions
        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((a) => a.object.typeOf === 'Offer')
        .filter((a) => a.object.itemOffered.typeOf === 'ProgramMembership');
    // tslint:disable-next-line:no-single-line-block-comment
    /* istanbul ignore if */
    if (programMembershipAuthorizeActions.length > 1) {
        throw new factory.errors.NotImplemented('Number of programMembership authorizeAction must be 1.');
    }
    const programMembershipAuthorizeAction = programMembershipAuthorizeActions.shift();

    const cutomerContact = params.transaction.object.customerContact;
    if (cutomerContact === undefined) {
        throw new factory.errors.Argument('transaction', 'Customer contact does not exist');
    }

    const seller: factory.order.ISeller = {
        id: params.transaction.seller.id,
        identifier: params.transaction.seller.identifier,
        name: params.transaction.seller.name.ja,
        legalName: params.transaction.seller.legalName,
        typeOf: params.transaction.seller.typeOf,
        telephone: params.transaction.seller.telephone,
        url: params.transaction.seller.url
    };

    // 購入者を識別する情報をまとめる
    const customerIdentifier = (Array.isArray(params.transaction.agent.identifier)) ? params.transaction.agent.identifier : [];
    const customer: factory.order.ICustomer = {
        id: params.transaction.agent.id,
        typeOf: params.transaction.agent.typeOf,
        name: `${cutomerContact.familyName} ${cutomerContact.givenName}`,
        url: '',
        identifier: customerIdentifier,
        ...cutomerContact
    };
    if (params.transaction.agent.memberOf !== undefined) {
        customer.memberOf = params.transaction.agent.memberOf;
    }

    let reservationNumber: number | undefined;
    const acceptedOffers: factory.order.IAcceptedOffer<factory.order.IItemOffered>[] = [];

    // 座席予約がある場合
    // tslint:disable-next-line:no-single-line-block-comment
    /* istanbul ignore else */
    if (seatReservationAuthorizeAction !== undefined) {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore next */
        if (seatReservationAuthorizeAction.result === undefined) {
            throw new factory.errors.Argument('transaction', 'Seat reservation result does not exist.');
        }

        const updTmpReserveSeatResult = seatReservationAuthorizeAction.result.responseBody;
        const screeningEvent = seatReservationAuthorizeAction.object.event;
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (screeningEvent === undefined) {
            throw new factory.errors.NotFound('seatReservationAuthorizeAction.object.event');
        }

        // 予約番号はCOAの仮予約番号と同じ
        reservationNumber = seatReservationAuthorizeAction.result.responseBody.tmpReserveNum;

        // 座席仮予約からオファー情報を生成する
        acceptedOffers.push(...updTmpReserveSeatResult.listTmpReserve.map((tmpReserve, index) => {
            const requestedOffer = seatReservationAuthorizeAction.object.acceptedOffer.filter((offer) => {
                return (offer.seatNumber === tmpReserve.seatNum && offer.seatSection === tmpReserve.seatSection);
            })[0];
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore next */
            if (requestedOffer === undefined) {
                throw new factory.errors.Argument('offers', '要求された供給情報と仮予約結果が一致しません。');
            }

            // 必ず定義されている前提
            const coaInfo = <factory.event.screeningEvent.ICOAInfo>screeningEvent.coaInfo;

            // チケットトークン(QRコード文字列)を作成
            const ticketToken = [
                coaInfo.theaterCode,
                coaInfo.dateJouei,
                // tslint:disable-next-line:no-magic-numbers
                (`00000000${updTmpReserveSeatResult.tmpReserveNum}`).slice(-8),
                // tslint:disable-next-line:no-magic-numbers
                (`000${index + 1}`).slice(-3)
            ].join('');

            const eventReservation: factory.reservation.event.IReservation<factory.event.screeningEvent.IEvent> = {
                typeOf: factory.reservationType.EventReservation,
                id: `${reservationNumber}-${index.toString()}`,
                checkedIn: false,
                attended: false,
                additionalTicketText: '',
                modifiedTime: params.orderDate,
                numSeats: 1,
                price: <number>requestedOffer.price,
                priceCurrency: requestedOffer.priceCurrency,
                reservationFor: screeningEvent,
                reservationNumber: `${reservationNumber}`,
                reservationStatus: factory.reservationStatusType.ReservationConfirmed,
                reservedTicket: {
                    typeOf: 'Ticket',
                    coaTicketInfo: requestedOffer.ticketInfo,
                    dateIssued: params.orderDate,
                    issuedBy: {
                        typeOf: screeningEvent.superEvent.location.typeOf,
                        name: screeningEvent.superEvent.location.name.ja
                    },
                    totalPrice: <number>requestedOffer.price,
                    priceCurrency: requestedOffer.priceCurrency,
                    ticketedSeat: {
                        typeOf: factory.placeType.Seat,
                        seatingType: {
                            typeOf: 'Default'
                        },
                        seatNumber: tmpReserve.seatNum,
                        seatRow: '',
                        seatSection: tmpReserve.seatSection
                    },
                    ticketNumber: ticketToken,
                    ticketToken: ticketToken,
                    underName: {
                        typeOf: factory.personType.Person,
                        name: customer.name
                    },
                    ticketType: <any>{
                        id: requestedOffer.ticketInfo.ticketCode,
                        name: {
                            ja: requestedOffer.ticketInfo.ticketName,
                            en: requestedOffer.ticketInfo.ticketNameEng
                        }
                    }
                },
                underName: {
                    typeOf: factory.personType.Person,
                    name: customer.name
                }
            };

            return {
                typeOf: <factory.offer.OfferType>'Offer',
                itemOffered: eventReservation,
                price: <number>eventReservation.price,
                priceCurrency: factory.priceCurrency.JPY,
                seller: {
                    typeOf: params.seller.typeOf,
                    name: screeningEvent.superEvent.location.name.ja
                }
            };
        }));
    }

    // 会員プログラムがある場合
    // tslint:disable-next-line:no-single-line-block-comment
    /* istanbul ignore if */
    if (programMembershipAuthorizeAction !== undefined) {
        acceptedOffers.push(programMembershipAuthorizeAction.object);
    }

    // 結果作成
    const discounts: factory.order.IDiscount[] = [];
    params.transaction.object.authorizeActions
        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((a) => a.object.typeOf === factory.action.authorize.discount.mvtk.ObjectType.Mvtk)
        .forEach((mvtkAuthorizeAction: factory.action.authorize.discount.mvtk.IAction) => {
            const discountCode = mvtkAuthorizeAction.object.seatInfoSyncIn.knyknrNoInfo.map(
                (knshInfo) => knshInfo.knyknrNo
            ).join(',');

            discounts.push({
                typeOf: 'Discount',
                name: 'ムビチケカード',
                discount: (<factory.action.authorize.discount.mvtk.IResult>mvtkAuthorizeAction.result).price,
                discountCode: discountCode,
                discountCurrency: factory.priceCurrency.JPY
            });
        });

    const paymentMethods: factory.order.IPaymentMethod<factory.paymentMethodType>[] = [];

    // クレジットカード決済があれば決済方法に追加
    params.transaction.object.authorizeActions
        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((a) => a.object.typeOf === factory.paymentMethodType.CreditCard)
        .forEach((creditCardAuthorizeAction: factory.action.authorize.paymentMethod.creditCard.IAction) => {
            const actionResult = <factory.action.authorize.paymentMethod.creditCard.IResult>creditCardAuthorizeAction.result;
            paymentMethods.push({
                name: 'クレジットカード',
                typeOf: factory.paymentMethodType.CreditCard,
                paymentMethodId: actionResult.execTranResult.orderId,
                additionalProperty: []
            });
        });

    // ポイント口座決済があれば決済方法に追加
    params.transaction.object.authorizeActions
        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((a) => a.object.typeOf === factory.paymentMethodType.Account)
        .forEach((pecorinoAuthorizeAction: factory.action.authorize.paymentMethod.account.IAction<factory.accountType.Point>) => {
            const actionResult =
                <factory.action.authorize.paymentMethod.account.IResult<factory.accountType.Point>>pecorinoAuthorizeAction.result;
            paymentMethods.push({
                name: 'ポイント口座',
                typeOf: factory.paymentMethodType.Account,
                paymentMethodId: actionResult.pendingTransaction.object.fromLocation.accountNumber,
                additionalProperty: []
            });
        });

    // ムビチケ決済があれば決済方法に追加
    params.transaction.object.authorizeActions
        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((a) => a.object.typeOf === factory.action.authorize.discount.mvtk.ObjectType.Mvtk)
        .forEach((mvtkAuthorizeAction: factory.action.authorize.discount.mvtk.IAction) => {
            // ムビチケ購入管理番号を決済IDに指定
            paymentMethods.push(...mvtkAuthorizeAction.object.seatInfoSyncIn.knyknrNoInfo.map(
                (knshInfo) => {
                    return {
                        name: 'ムビチケ',
                        typeOf: factory.paymentMethodType.MovieTicket,
                        paymentMethod: factory.paymentMethodType.MovieTicket,
                        paymentMethodId: knshInfo.knyknrNo,
                        additionalProperty: []
                    };
                }
            ));
        });

    // tslint:disable-next-line:no-single-line-block-comment
    /* istanbul ignore if */
    if (params.seller.location === undefined || params.seller.location.branchCode === undefined) {
        throw new factory.errors.ServiceUnavailable('Seller location branchCode undefined');
    }

    const url = (reservationNumber !== undefined) ? util.format(
        '%s/inquiry/login?theater=%s&reserve=%s',
        process.env.ORDER_INQUIRY_ENDPOINT,
        params.seller.location.branchCode,
        reservationNumber
    ) : '';

    // 決済方法から注文金額の計算
    let price = 0;
    Object.keys(factory.paymentMethodType)
        .forEach((key) => {
            const paymentMethodType = <factory.paymentMethodType>(<any>factory.paymentMethodType)[key];
            price += params.transaction.object.authorizeActions
                .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
                .filter((a) => a.object.typeOf === paymentMethodType)
                .filter((a) => {
                    const totalPaymentDue = (<IAuthorizeAnyPaymentResult>a.result).totalPaymentDue;

                    return totalPaymentDue !== undefined && totalPaymentDue.currency === factory.priceCurrency.JPY;
                })
                .reduce((a, b) => a + (<IAuthorizeAnyPaymentResult>b.result).amount, 0);
        });

    return {
        typeOf: 'Order',
        seller: seller,
        customer: customer,
        price: price,
        priceCurrency: factory.priceCurrency.JPY,
        paymentMethods: paymentMethods,
        discounts: discounts,
        confirmationNumber: params.confirmationNumber,
        orderNumber: params.orderNumber,
        acceptedOffers: acceptedOffers,
        url: url,
        orderStatus: params.orderStatus,
        orderDate: params.orderDate,
        isGift: params.isGift
    };
}

export async function createEmailMessageFromTransaction(params: {
    transaction: factory.transaction.placeOrder.ITransaction;
    order: factory.order.IOrder;
    seller: ISeller;
}): Promise<factory.creativeWork.message.email.ICreativeWork> {
    return new Promise<factory.creativeWork.message.email.ICreativeWork>((resolve, reject) => {
        const seller = params.transaction.seller;
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.order.acceptedOffers[0].itemOffered.typeOf === factory.reservationType.EventReservation) {
            const event = params.order.acceptedOffers[0].itemOffered.reservationFor;

            pug.renderFile(
                `${__dirname}/../../../emails/sendOrder/text.pug`,
                {
                    familyName: params.order.customer.familyName,
                    givenName: params.order.customer.givenName,
                    confirmationNumber: params.order.confirmationNumber,
                    eventStartDate: util.format(
                        '%s - %s',
                        moment(event.startDate).locale('ja').tz('Asia/Tokyo').format('YYYY年MM月DD日(ddd) HH:mm'),
                        moment(event.endDate).tz('Asia/Tokyo').format('HH:mm')
                    ),
                    workPerformedName: event.workPerformed.name,
                    screenName: event.location.name.ja,
                    reservedSeats: params.order.acceptedOffers.map((o) => {
                        const reservation = (<factory.reservation.event.IReservation<any>>o.itemOffered);
                        const ticketedSeat = reservation.reservedTicket.ticketedSeat;
                        const coaTicketInfo = reservation.reservedTicket.coaTicketInfo;

                        return util.format(
                            '%s %s ￥%s',
                            (ticketedSeat !== undefined) ? ticketedSeat.seatNumber : '',
                            (coaTicketInfo !== undefined) ? coaTicketInfo.ticketName : '',
                            (coaTicketInfo !== undefined) ? coaTicketInfo.salePrice : ''
                        );
                    }).join('\n'),
                    price: params.order.price,
                    inquiryUrl: params.order.url,
                    sellerName: params.order.seller.name,
                    sellerTelephone: params.seller.telephone
                },
                (renderMessageErr, message) => {
                    if (renderMessageErr instanceof Error) {
                        reject(renderMessageErr);

                        return;
                    }

                    debug('message:', message);
                    pug.renderFile(
                        `${__dirname}/../../../emails/sendOrder/subject.pug`,
                        {
                            sellerName: params.order.seller.name
                        },
                        (renderSubjectErr, subject) => {
                            // tslint:disable-next-line:no-single-line-block-comment
                            /* istanbul ignore if */
                            if (renderSubjectErr instanceof Error) {
                                reject(renderSubjectErr);

                                return;
                            }

                            debug('subject:', subject);

                            const email: factory.creativeWork.message.email.ICreativeWork = {
                                typeOf: factory.creativeWorkType.EmailMessage,
                                identifier: `placeOrderTransaction-${params.transaction.id}`,
                                name: `placeOrderTransaction-${params.transaction.id}`,
                                sender: {
                                    typeOf: seller.typeOf,
                                    name: seller.name.ja,
                                    email: 'noreply@ticket-cinemasunshine.com'
                                },
                                toRecipient: {
                                    typeOf: params.transaction.agent.typeOf,
                                    name: `${params.order.customer.familyName} ${params.order.customer.givenName}`,
                                    email: params.order.customer.email
                                },
                                about: subject,
                                text: message
                            };
                            resolve(email);
                        }
                    );
                }
            );
        }
    });
}

/**
 * 取引のポストアクションを作成する
 */
// tslint:disable-next-line:max-func-body-length
export async function createPotentialActionsFromTransaction(params: {
    transaction: factory.transaction.placeOrder.ITransaction;
    // customerContact: factory.transaction.placeOrder.ICustomerContact;
    order: factory.order.IOrder;
    seller: ISeller;
    sendEmailMessage?: boolean;
    emailTemplate?: string;
}): Promise<factory.transaction.placeOrder.IPotentialActions> {
    // 予約確定アクション
    const seatReservationAuthorizeActions =
        <factory.action.authorize.offer.seatReservation.IAction<factory.service.webAPI.Identifier.COA>[]>
        params.transaction.object.authorizeActions
            .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
            .filter((a) => a.object.typeOf === factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation);
    const confirmReservationActions: factory.action.interact.confirm.reservation.IAttributes<factory.service.webAPI.Identifier.COA>[] = [];
    // tslint:disable-next-line:max-func-body-length
    seatReservationAuthorizeActions.forEach((a) => {
        const actionResult = a.result;

        a.instrument = {
            typeOf: 'WebAPI',
            identifier: factory.service.webAPI.Identifier.COA
        };

        if (actionResult !== undefined) {
            const updTmpReserveSeatArgs = actionResult.requestBody;
            const updTmpReserveSeatResult = actionResult.responseBody;

            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore if */
            if (updTmpReserveSeatArgs === undefined || updTmpReserveSeatResult === undefined) {
                throw new factory.errors.Argument('Invalid Seat Reservation Authorize Action');
            }

            // 電話番号のフォーマットを日本人にリーダブルに調整(COAではこのフォーマットで扱うので)
            const phoneUtil = PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(params.order.customer.telephone, 'JP');
            let telNum = phoneUtil.format(phoneNumber, PhoneNumberFormat.NATIONAL);

            // COAでは数字のみ受け付けるので数字以外を除去
            telNum = telNum.replace(/[^\d]/g, '');

            const updReserveArgs: factory.action.interact.confirm.reservation.IObject4COA = {
                theaterCode: updTmpReserveSeatArgs.theaterCode,
                dateJouei: updTmpReserveSeatArgs.dateJouei,
                titleCode: updTmpReserveSeatArgs.titleCode,
                titleBranchNum: updTmpReserveSeatArgs.titleBranchNum,
                timeBegin: updTmpReserveSeatArgs.timeBegin,
                tmpReserveNum: updTmpReserveSeatResult.tmpReserveNum,
                // tslint:disable-next-line:no-irregular-whitespace
                reserveName: `${params.order.customer.familyName}　${params.order.customer.givenName}`,
                // tslint:disable-next-line:no-irregular-whitespace
                reserveNameJkana: `${params.order.customer.familyName}　${params.order.customer.givenName}`,
                telNum: telNum,
                mailAddr: params.order.customer.email,
                reserveAmount: params.order.price, // デフォルトのpriceCurrencyがJPYなのでこれでよし
                listTicket: params.order.acceptedOffers
                    .filter((offer) => offer.itemOffered.typeOf === factory.reservationType.EventReservation)
                    .map((offer) => {
                        const reservation = <factory.reservation.event.IReservation<any>>offer.itemOffered;
                        const coaTicketInfo = reservation.reservedTicket.coaTicketInfo;
                        if (coaTicketInfo === undefined) {
                            throw new factory.errors.Argument('Transaction', 'coaTicketInfo undefined in accepted offers');
                        }

                        return coaTicketInfo;
                    })
            };

            confirmReservationActions.push({
                typeOf: <factory.actionType.ConfirmAction>factory.actionType.ConfirmAction,
                object: updReserveArgs,
                agent: params.transaction.agent,
                purpose: params.order,
                instrument: a.instrument
            });
        }
    });

    // クレジットカード支払いアクション
    const authorizeCreditCardActions = <factory.action.authorize.paymentMethod.creditCard.IAction[]>
        params.transaction.object.authorizeActions
            .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
            .filter((a) => a.result !== undefined)
            .filter((a) => a.result.paymentMethod === factory.paymentMethodType.CreditCard);
    const payCreditCardActions: factory.action.trade.pay.IAttributes<factory.paymentMethodType.CreditCard>[] = [];
    authorizeCreditCardActions.forEach((a) => {
        const result = <factory.action.authorize.paymentMethod.creditCard.IResult>a.result;
        if (result.paymentStatus === factory.paymentStatusType.PaymentDue) {
            payCreditCardActions.push({
                typeOf: <factory.actionType.PayAction>factory.actionType.PayAction,
                object: [{
                    typeOf: <factory.action.trade.pay.TypeOfObject>'PaymentMethod',
                    paymentMethod: {
                        name: result.name,
                        typeOf: <factory.paymentMethodType.CreditCard>result.paymentMethod,
                        paymentMethodId: result.paymentMethodId,
                        totalPaymentDue: result.totalPaymentDue,
                        additionalProperty: (Array.isArray(result.additionalProperty)) ? result.additionalProperty : []
                    },
                    price: result.amount,
                    priceCurrency: factory.priceCurrency.JPY,
                    entryTranArgs: result.entryTranArgs,
                    execTranArgs: result.execTranArgs
                }],
                agent: params.transaction.agent,
                purpose: params.order
            });
        }
    });

    // 口座支払いアクション
    const authorizeAccountActions = <factory.action.authorize.paymentMethod.account.IAction<factory.accountType>[]>
        params.transaction.object.authorizeActions
            .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
            .filter((a) => a.result !== undefined)
            .filter((a) => a.result.paymentMethod === factory.paymentMethodType.Account);
    const payAccountActions: factory.action.trade.pay.IAttributes<factory.paymentMethodType.Account>[] =
        authorizeAccountActions.map((a) => {
            const result = <factory.action.authorize.paymentMethod.account.IResult<factory.accountType>>a.result;

            return {
                typeOf: <factory.actionType.PayAction>factory.actionType.PayAction,
                object: [{
                    typeOf: <'PaymentMethod'>'PaymentMethod',
                    paymentMethod: {
                        name: result.name,
                        typeOf: <factory.paymentMethodType.Account>result.paymentMethod,
                        paymentMethodId: result.paymentMethodId,
                        totalPaymentDue: result.totalPaymentDue,
                        additionalProperty: (Array.isArray(result.additionalProperty)) ? result.additionalProperty : []
                    },
                    pendingTransaction:
                        (<factory.action.authorize.paymentMethod.account.IResult<factory.accountType>>a.result).pendingTransaction
                }],
                agent: params.transaction.agent,
                purpose: params.order
            };
        });

    const payMovieTicketActions: factory.action.trade.pay.IAttributes<factory.paymentMethodType.MovieTicket>[] = [];

    // ポイントインセンティブに対する承認アクションの分だけ、ポイントインセンティブ付与アクションを作成する
    let givePointAwardActions: factory.action.transfer.give.pointAward.IAttributes[] = [];
    const pointAwardAuthorizeActions =
        (<factory.action.authorize.award.point.IAction[]>params.transaction.object.authorizeActions)
            .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
            .filter((a) => a.object.typeOf === factory.action.authorize.award.point.ObjectType.PointAward);
    givePointAwardActions = pointAwardAuthorizeActions.map((a) => {
        const actionResult = <factory.action.authorize.award.point.IResult>a.result;

        return {
            typeOf: <factory.actionType.GiveAction>factory.actionType.GiveAction,
            agent: params.transaction.seller,
            recipient: params.transaction.agent,
            object: {
                typeOf: factory.action.transfer.give.pointAward.ObjectType.PointAward,
                pointTransaction: actionResult.pointTransaction,
                pointAPIEndpoint: actionResult.pointAPIEndpoint
            },
            purpose: params.order
        };
    });

    // メール送信ONであれば送信アクション属性を生成
    // tslint:disable-next-line:no-suspicious-comment
    // TODO メール送信アクションをセットする
    // 現時点では、フロントエンドからメール送信タスクを作成しているので不要
    let sendEmailMessageActionAttributes: factory.action.transfer.send.message.email.IAttributes | null = null;
    if (params.sendEmailMessage === true) {
        const emailMessage = await createEmailMessageFromTransaction({
            transaction: params.transaction,
            order: params.order,
            seller: params.seller
        });
        sendEmailMessageActionAttributes = {
            typeOf: factory.actionType.SendAction,
            object: emailMessage,
            agent: params.transaction.seller,
            recipient: params.transaction.agent,
            potentialActions: {},
            purpose: params.order
        };
    }

    // 会員プログラムが注文アイテムにあれば、プログラム更新タスクを追加
    const registerProgramMembershipTaskAttributes: factory.task.IAttributes<factory.taskName.RegisterProgramMembership>[] = [];
    const programMembershipOffers = <factory.order.IAcceptedOffer<factory.programMembership.IProgramMembership>[]>
        params.order.acceptedOffers.filter(
            (o) => o.itemOffered.typeOf === <factory.programMembership.ProgramMembershipType>'ProgramMembership'
        );
    if (programMembershipOffers.length > 0) {
        registerProgramMembershipTaskAttributes.push(...programMembershipOffers.map((o) => {
            const actionAttributes: factory.action.interact.register.programMembership.IAttributes = {
                typeOf: factory.actionType.RegisterAction,
                agent: params.transaction.agent,
                object: o
            };

            // どういう期間でいくらのオファーなのか
            const eligibleDuration = o.eligibleDuration;
            if (eligibleDuration === undefined) {
                throw new factory.errors.NotFound('Order.acceptedOffers.eligibleDuration');
            }
            // 期間単位としては秒のみ実装
            if (eligibleDuration.unitCode !== factory.unitCode.Sec) {
                throw new factory.errors.NotImplemented('Only \'SEC\' is implemented for eligibleDuration.unitCode ');
            }
            // プログラム更新日時は、今回のプログラムの所有期限
            const runsAt = moment(params.order.orderDate).add(eligibleDuration.value, 'seconds').toDate();

            return {
                name: <factory.taskName.RegisterProgramMembership>factory.taskName.RegisterProgramMembership,
                status: factory.taskStatus.Ready,
                runsAt: runsAt,
                remainingNumberOfTries: 10,
                numberOfTried: 0,
                executionResults: [],
                data: actionAttributes
            };
        }));
    }

    const sendOrderActionAttributes: factory.action.transfer.send.order.IAttributes = {
        typeOf: factory.actionType.SendAction,
        object: params.order,
        agent: params.transaction.seller,
        recipient: params.transaction.agent,
        potentialActions: {
            sendEmailMessage: (sendEmailMessageActionAttributes !== null) ? sendEmailMessageActionAttributes : undefined,
            registerProgramMembership: registerProgramMembershipTaskAttributes
        }
    };

    return {
        order: {
            typeOf: factory.actionType.OrderAction,
            object: params.order,
            agent: params.transaction.agent,
            potentialActions: {
                payCreditCard: payCreditCardActions,
                payAccount: payAccountActions,
                payMovieTicket: payMovieTicketActions,
                sendOrder: sendOrderActionAttributes,
                confirmReservation: confirmReservationActions,
                givePointAward: givePointAwardActions
            }
        }
    };
}
