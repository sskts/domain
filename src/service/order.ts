/**
 * 注文サービス
 *
 * @namespace service/order
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as monapt from 'monapt';
import { Document } from 'mongoose';

import OrderAdapter from '../adapter/order';
import TransactionAdapter from '../adapter/transaction';

import FilmAdapter from '../oldAdapter/film';
import PerformanceAdapter from '../oldAdapter/performance';
import ScreenAdapter from '../oldAdapter/screen';
import TheaterAdapter from '../oldAdapter/theater';

import { IAuthorization as IOldAuthorization } from '../oldFactory/authorization';
import { IAuthorization as IOldSeatReservationAuthorization } from '../oldFactory/authorization/coaSeatReservation';
import { IAuthorization as IOldGMOAuthorization } from '../oldFactory/authorization/gmo';
import { IAuthorization as IOldMvtkAuthorization } from '../oldFactory/authorization/mvtk';
import { IOwner as IOldAnonymousOwner } from '../oldFactory/owner/anonymous';

import { IFilm } from '../oldFactory/film';
import { IPerformanceWithReferenceDetails } from '../oldFactory/performance';
import { IScreen } from '../oldFactory/screen';
import { ITheater } from '../oldFactory/theater';

import { ITransaction as IOldTransaction } from '../oldFactory/transaction';
import { ITransactionInquiryKey as IOldTransactionInquiryKey } from '../oldFactory/transactionInquiryKey';

const debug = createDebug('sskts-domain:service:order');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

export interface ITransactionDetail {
    id: string;
    closedAt: Date;
    status: string;
    inquiryKey: IOldTransactionInquiryKey;
    anonymous: {
        givenName: string;
        familyName: string;
        email: string;
        telephone: string;
    };
    film: IFilm;
    performance: IPerformanceWithReferenceDetails;
    screen: IScreen;
    theater: ITheater;
    ticketsStr: string;
    seatReservationAuthorization: IOldSeatReservationAuthorization;
    gmoAuthorization?: IOldGMOAuthorization;
    mvtkAuthorization?: IOldMvtkAuthorization;
    qrCodesBySeatCode: {
        seat_code: string;
        qr: string;
    }[];
}

export function createFromOldTransaction(transactionId: string) {
    return async (
        __: OrderAdapter,
        transactionAdapter: TransactionAdapter,
        filmAdapter: FilmAdapter,
        performanceAdapter: PerformanceAdapter,
        screenAdapter: ScreenAdapter,
        theaterAdapter: TheaterAdapter
    ) => {
        const transaction = <IOldTransaction | null>await transactionAdapter.transactionModel.findOne({
            _id: transactionId,
            status: 'CLOSED'
        }).exec();

        if (transaction === null) {
            throw new Error('transaction not found');
        }

        const detail = await getOldTransactionDetails(transaction.id)(
            transactionAdapter,
            filmAdapter,
            performanceAdapter,
            screenAdapter,
            theaterAdapter
        );
        debug('detail:', detail);

        const order = createOrder(detail);
        debug('order:', order);

        // await orderAdapter.orderModel.findOneAndUpdate(
        //     {
        //         orderNumber: order.orderNumber
        //     },
        //     order,
        //     { upsert: true }
        // ).exec();
    };
}

/**
 * create order object from transaction parameters
 * @function
 * @memberof factory/order
 */
// tslint:disable-next-line:max-func-body-length
function createOrder(params: ITransactionDetail): factory.order.IOrder {
    let paymentMethod: factory.order.IPaymentMethod;

    if (params.gmoAuthorization !== undefined && params.mvtkAuthorization !== undefined) {
        paymentMethod = {
            typeOf: 'CreditCard',
            identifier: params.gmoAuthorization.gmo_order_id
        };
    } else if (params.gmoAuthorization !== undefined) {
        paymentMethod = {
            typeOf: 'CreditCard',
            identifier: params.gmoAuthorization.gmo_order_id
        };
    } else if (params.mvtkAuthorization !== undefined) {
        paymentMethod = {
            typeOf: 'Mvtk',
            identifier: ''
        };
    } else {
        throw new Error('payment method does not exist');
    }

    const identifier = [
        params.theater.id,
        params.film.coa_title_code,
        params.film.coa_title_branch_num,
        params.performance.day,
        params.screen.coa_screen_code,
        params.performance.time_start
    ].join('');
    const workPerformed = {
        typeOf: factory.creativeWorkType.Movie,
        contentRating: params.film.kbn_eirin,
        duration: moment.duration(params.film.minutes, 'm').toISOString(),
        name: params.film.name_original,
        identifier: params.film.coa_title_code
    };
    const individualScreeningEvent: factory.event.individualScreeningEvent.IEvent = {
        identifier: identifier,
        typeOf: factory.eventType.IndividualScreeningEvent,
        name: params.film.name,
        endDate: moment(`${params.performance.day} ${params.performance.time_end} +09:00`, 'YYYYMMDD HHmm Z').toDate(),
        startDate: moment(`${params.performance.day} ${params.performance.time_start} +09:00`, 'YYYYMMDD HHmm Z').toDate(),
        eventStatus: <any>'EventScheduled',
        location: {
            name: {
                en: params.screen.name.en,
                ja: params.screen.name.ja
            },
            branchCode: params.screen.coa_screen_code,
            typeOf: factory.placeType.ScreeningRoom
        },
        workPerformed: workPerformed,
        superEvent: {
            typeOf: factory.eventType.ScreeningEvent,
            eventStatus: <any>'EventScheduled',
            coaInfo: {
                titleBranchNum: params.film.coa_title_branch_num,
                kbnJoueihousiki: params.film.kbn_joueihousiki,
                kbnJimakufukikae: params.film.kbn_jimakufukikae,
                flgMvtkUse: params.film.flg_mvtk_use,
                dateMvtkBegin: params.film.date_mvtk_begin
            },
            startDate: (moment(`${params.film.date_start} +09:00`, 'YYYYMMDD Z').isValid())
                ? moment(`${params.film.date_start} +09:00`, 'YYYYMMDD Z').toDate()
                : undefined,
            endDate: (moment(`${params.film.date_end} +09:00`, 'YYYYMMDD Z').isValid())
                ? moment(`${params.film.date_end} +09:00`, 'YYYYMMDD Z').toDate()
                : undefined,
            duration: moment.duration(params.film.minutes, 'm').toISOString(),
            workPerformed: workPerformed,
            videoFormat: params.film.kbn_eizou,
            location: {
                typeOf: factory.placeType.MovieTheater,
                branchCode: params.theater.id,
                name: params.theater.name,
                kanaName: params.theater.name_kana
            },
            name: params.film.name,
            kanaName: params.film.name_kana,
            alternativeHeadline: params.film.name_short,
            identifier: `${params.theater.id}${params.film.coa_title_code}${params.film.coa_title_branch_num}`
        },
        coaInfo: {
            flgEarlyBooking: params.performance.coa_flg_early_booking,
            rsvEndDate: params.performance.coa_rsv_end_date,
            rsvStartDate: params.performance.coa_rsv_start_date,
            availableNum: params.performance.coa_available_num,
            nameServiceDay: params.performance.coa_name_service_day,
            kbnAcoustic: params.performance.coa_kbn_acoustic,
            kbnService: params.performance.coa_kbn_service,
            trailerTime: params.performance.coa_trailer_time,
            screenCode: params.screen.coa_screen_code,
            timeBegin: params.performance.time_start,
            titleBranchNum: params.film.coa_title_branch_num,
            titleCode: params.film.coa_title_code,
            dateJouei: params.performance.day,
            theaterCode: params.theater.id
        }
    };

    return {
        typeOf: 'Order',
        seller: {
            name: params.theater.name.ja,
            url: params.theater.websites[0].url
        },
        orderNumber: `${params.performance.theater.id}-${params.inquiryKey.reserve_num}`,
        priceCurrency: <any>'JPY',
        price: (params.gmoAuthorization === undefined) ? 0 : params.gmoAuthorization.price,
        acceptedOffers: params.seatReservationAuthorization.assets.map(
            (asset, index): factory.reservation.IReservation => {
                return {
                    numSeats: 1,
                    price: asset.sale_price,
                    priceCurrency: <any>'JPY',
                    typeOf: 'Reservation',
                    additionalTicketText: '',
                    modifiedTime: params.closedAt,
                    reservationFor: individualScreeningEvent,
                    reservationNumber: `${params.inquiryKey.reserve_num}-${index.toString()}`,
                    reservationStatus: factory.reservationStatusType.ReservationConfirmed,
                    // tslint:disable-next-line:no-suspicious-comment
                    // TODO implementation
                    reservedTicket: <any>{},
                    // reservedTicket: {
                    //     coaTicketInfo: selectedTicket,
                    //     dateIssued: new Date(),
                    //     issuedBy: { // todo 値セット
                    //         typeOf: '',
                    //         name: ''
                    //     },
                    //     priceCurrency: PriceCurrency.JPY,
                    //     ticketedSeat: {
                    //         seatingType: '',
                    //         seatNumber: tmpReserve.seatNum,
                    //         seatRow: '',
                    //         seatSection: tmpReserve.seatSection
                    //     },
                    //     ticketNumber: ticketToken,
                    //     ticketToken: ticketToken,
                    //     underName: {
                    //         typeOf: 'Person',
                    //         name: ''
                    //     }
                    // },
                    underName: {
                        typeOf: 'Person',
                        name: `${params.anonymous.familyName} ${params.anonymous.givenName}`
                    }
                };
            }),
        url: '',
        orderStatus: <any>'OrderDelivered',
        paymentMethod: paymentMethod,
        paymentMethodId: '',
        orderDate: params.closedAt,
        isGift: false,
        discount: 0,
        discountCurrency: '',
        customer: {
            name: `${params.anonymous.familyName} ${params.anonymous.givenName}`
        },
        orderInquiryKey: {
            theaterCode: params.inquiryKey.theater_code,
            orderNumber: params.inquiryKey.reserve_num,
            telephone: params.inquiryKey.tel
        }
    };
}

// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
export function getOldTransactionDetails(transactionId: string) {
    return async (
        transactionAdapter: TransactionAdapter,
        filmAdapter: FilmAdapter,
        performanceAdapter: PerformanceAdapter,
        screenAdapter: ScreenAdapter,
        theaterAdapter: TheaterAdapter
    ): Promise<ITransactionDetail> => {
        const transactionDoc = await transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (transactionDoc === null) {
            throw new Error('transaction not found');
        }

        const transaction = <IOldTransaction>transactionDoc.toObject();
        debug('transaction:', transaction);
        const anonymousOwner = <IOldAnonymousOwner>transaction.owners.find(
            (owner) => owner.group === 'ANONYMOUS'
        );
        const authorizations = await findAuthorizationsById(transaction.id)(transactionAdapter);
        // GMOオーソリを取り出す
        const gmoAuthorization = <IOldGMOAuthorization | undefined>authorizations.find(
            (authorization) => authorization.group === 'GMO'
        );
        // ムビチケオーソリを取り出す
        const mvtkAuthorization = <IOldMvtkAuthorization | undefined>authorizations.find(
            (authorization) => authorization.group === 'MVTK'
        );
        // 座席予約オーソリを取り出す
        const seatReservationAuthorization = <IOldSeatReservationAuthorization>authorizations.find(
            (authorization) => authorization.group === 'COA_SEAT_RESERVATION'
        );
        let qrCodesBySeatCode: {
            seat_code: string;
            qr: string;
        }[] = [];
        if (transaction.inquiry_key !== undefined) {
            // COAからQRを取得
            const stateReserveResult = await COA.services.reserve.stateReserve(
                {
                    theaterCode: transaction.inquiry_key.theater_code,
                    reserveNum: transaction.inquiry_key.reserve_num,
                    telNum: transaction.inquiry_key.tel
                }
            );

            // 本予約済みであればQRコード送信
            if (stateReserveResult !== null) {
                qrCodesBySeatCode = stateReserveResult.listTicket.map((ticket) => {
                    return {
                        seat_code: ticket.seatNum,
                        qr: `https://chart.apis.google.com/chart?chs=400x400&cht=qr&chl=${ticket.seatQrcode}`
                    };
                });
            }
        }

        let ticketsStr: string = '';

        const performanceDoc = <Document>await performanceAdapter.model.findById(seatReservationAuthorization.assets[0].performance)
            .populate('film')
            .populate('theater')
            .populate('screen')
            .exec();
        const performance = <IPerformanceWithReferenceDetails>performanceDoc.toObject();

        const theaterDoc = <Document>await theaterAdapter.model.findById(performance.theater.id).exec();
        const theater = <ITheater>theaterDoc.toObject();

        const screenDoc = <Document>await screenAdapter.model.findById(performance.screen.id).exec();
        const screen = <IScreen>screenDoc.toObject();

        const filmDoc = <Document>await filmAdapter.model.findById(performance.film.id).exec();
        const film = <IFilm>filmDoc.toObject();

        ticketsStr = seatReservationAuthorization.assets.map(
            (asset) => `●${asset.seat_code} ${asset.ticket_name.ja} ￥${asset.sale_price}`
        ).join('\n');

        return {
            id: transaction.id,
            closedAt: <Date>transaction.closed_at,
            status: transaction.status,
            inquiryKey: <IOldTransactionInquiryKey>transaction.inquiry_key,
            anonymous: {
                givenName: anonymousOwner.name_first,
                familyName: anonymousOwner.name_last,
                email: anonymousOwner.email,
                telephone: anonymousOwner.tel
            },
            film: film,
            performance: performance,
            screen: screen,
            theater: theater,
            ticketsStr: ticketsStr,
            seatReservationAuthorization: seatReservationAuthorization,
            gmoAuthorization: gmoAuthorization,
            mvtkAuthorization: mvtkAuthorization,
            qrCodesBySeatCode: qrCodesBySeatCode
        };
    };
}

export function findAuthorizationsById(transactionId: string) {
    return async (transactionAdapter: TransactionAdapter): Promise<IOldAuthorization[]> => {
        const authorizations = (await transactionAdapter.transactionEventModel.find(
            {
                transaction: transactionId,
                group: 'AUTHORIZE'
            },
            'authorization'
        )
            .setOptions({ maxTimeMS: 10000 })
            .exec())
            .map((doc) => <IOldAuthorization>doc.get('authorization'));
        const removedAuthorizationIds = (await transactionAdapter.transactionEventModel.find(
            {
                transaction: transactionId,
                group: 'UNAUTHORIZE'
            },
            'authorization.id'
        )
            .setOptions({ maxTimeMS: 10000 })
            .exec())
            .map((doc) => doc.get('authorization.id'));

        return authorizations.filter(
            (authorization) => removedAuthorizationIds.indexOf(authorization.id) < 0
        );
    };
}

export function createFromTransaction(transaction: IPlaceOrderTransaction) {
    return async (orderAdapter: OrderAdapter) => {
        if (transaction.result !== undefined) {
            const order = transaction.result.order;

            await orderAdapter.orderModel.findOneAndUpdate(
                {
                    orderNumber: order.orderNumber
                },
                order,
                { upsert: true }
            ).exec();
        }
    };
}

/**
 * 注文内容を照会する
 */
export function findByOrderInquiryKey(orderInquiryKey: factory.order.IOrderInquiryKey) {
    return async (orderAdapter: OrderAdapter) => {
        return await orderAdapter.orderModel.findOne(
            {
                'orderInquiryKey.theaterCode': orderInquiryKey.theaterCode,
                'orderInquiryKey.orderNumber': orderInquiryKey.orderNumber,
                'orderInquiryKey.telephone': orderInquiryKey.telephone
            }
        ).exec()
            .then((doc) => (doc === null) ? monapt.None : monapt.Option(<factory.order.IOrder>doc.toObject()));
    };
}
