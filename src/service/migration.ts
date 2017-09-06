/**
 * migration v22->v23 service
 * @namespace service/migration
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import { MongoRepository as OrderRepository } from '../repo/order';

import FilmAdapter from '../v22/adapter/film';
import PerformanceAdapter from '../v22/adapter/performance';
import ScreenAdapter from '../v22/adapter/screen';
import TheaterAdapter from '../v22/adapter/theater';
import TransactionAdapter from '../v22/adapter/transaction';

import { IAuthorization as IOldSeatReservationAuthorization } from '../v22/factory/authorization/coaSeatReservation';
import { IAuthorization as IOldGMOAuthorization } from '../v22/factory/authorization/gmo';
import { IAuthorization as IOldMvtkAuthorization } from '../v22/factory/authorization/mvtk';
import { IOwner as IOldAnonymousOwner } from '../v22/factory/owner/anonymous';

import { IFilm } from '../v22/factory/film';
import { IPerformanceWithReferenceDetails } from '../v22/factory/performance';
import { IScreen } from '../v22/factory/screen';
import { ITheater } from '../v22/factory/theater';

import { ITransaction as IOldTransaction } from '../v22/factory/transaction';
import { ITransactionInquiryKey as IOldTransactionInquiryKey } from '../v22/factory/transactionInquiryKey';

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
        orderRepository: OrderRepository,
        transactionRepository: TransactionAdapter,
        filmRepository: FilmAdapter,
        performanceRepository: PerformanceAdapter,
        screenRepository: ScreenAdapter,
        theaterRepository: TheaterAdapter
    ) => {
        const transaction = <IOldTransaction | null>await transactionRepository.transactionModel.findOne({
            _id: transactionId,
            status: 'CLOSED'
        }).exec();

        if (transaction === null) {
            throw new Error('transaction not found');
        }

        const detail = await getOldTransactionDetails(transaction.id)(
            transactionRepository,
            filmRepository,
            performanceRepository,
            screenRepository,
            theaterRepository
        );
        debug('detail:', detail);

        const order = createOrder(detail);
        debug('order:', order);

        await orderRepository.orderModel.findOneAndUpdate(
            {
                orderNumber: order.orderNumber
            },
            order,
            { upsert: true }
        ).exec();
    };
}

/**
 * create order object from transaction parameters
 * @function
 * @memberof factory/order
 */
// tslint:disable-next-line:max-func-body-length
function createOrder(params: ITransactionDetail): factory.order.IOrder {
    const paymentMethods: factory.order.IPaymentMethod[] = [];

    if (params.gmoAuthorization !== undefined) {
        paymentMethods.push({
            name: 'クレジットカード',
            paymentMethod: 'CreditCard',
            paymentMethodId: params.gmoAuthorization.gmo_order_id
        });
    } else if (params.mvtkAuthorization !== undefined) {
        // tslint:disable-next-line:no-suspicious-comment
        // TODO discounts
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
        duration: moment.duration(params.film.minutes, 'm').toISOString(),
        name: params.film.name_original,
        identifier: params.film.coa_title_code
    };
    const customerName = `${params.anonymous.familyName} ${params.anonymous.givenName}`;
    // tslint:disable-next-line:no-suspicious-comment
    // TODO COAの区分属性を追加する
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
                // kbnJoueihousiki: params.film.kbn_joueihousiki,
                // kbnJimakufukikae: params.film.kbn_jimakufukikae,
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
            location: {
                typeOf: factory.placeType.MovieTheater,
                branchCode: params.theater.id,
                name: params.theater.name,
                kanaName: params.theater.name_kana
            },
            organizer: {
                typeOf: factory.organization.movieTheater.toString(),
                identifier: `MovieTheater-${params.theater.id}`,
                name: params.theater.name
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
            typeOf: 'MovieTheater',
            name: params.theater.name.ja,
            url: params.theater.websites[0].url
        },
        confirmationNumber: params.inquiryKey.reserve_num,
        orderNumber: `${params.performance.theater.id}-${params.inquiryKey.reserve_num}`,
        priceCurrency: factory.priceCurrency.JPY,
        price: (params.gmoAuthorization === undefined) ? 0 : params.gmoAuthorization.price,
        acceptedOffers: params.seatReservationAuthorization.assets.map(
            (asset, index): factory.order.IOffer => {
                const qrCodeInfo = params.qrCodesBySeatCode.find((qrCode) => qrCode.seat_code === asset.seat_code);
                if (qrCodeInfo === undefined) {
                    throw new Error('qr not found');
                }
                const ticketToken = qrCodeInfo.qr;

                const coaTicketInfo: factory.offer.ICOATicketInfo = {
                    ticketName: asset.ticket_name.ja,
                    ticketNameKana: asset.ticket_name_kana,
                    ticketNameEng: asset.ticket_name.en,
                    ticketCode: asset.ticket_code,
                    stdPrice: asset.std_price,
                    addPrice: asset.add_price,
                    disPrice: asset.dis_price,
                    salePrice: asset.sale_price,
                    mvtkAppPrice: asset.mvtk_app_price,
                    ticketCount: 1,
                    seatNum: asset.seat_code,
                    addGlasses: asset.add_glasses,
                    kbnEisyahousiki: asset.kbn_eisyahousiki,
                    mvtkNum: asset.mvtk_num,
                    mvtkKbnDenshiken: asset.mvtk_kbn_denshiken,
                    mvtkKbnMaeuriken: asset.mvtk_kbn_kensyu,
                    mvtkKbnKensyu: asset.mvtk_kbn_kensyu,
                    mvtkSalesPrice: asset.mvtk_sales_price
                };

                // tslint:disable-next-line:no-suspicious-comment
                // TODO 諸々まだ値微調整
                return {
                    price: asset.sale_price,
                    priceCurrency: factory.priceCurrency.JPY,
                    seller: {
                        typeOf: 'MovieTheater',
                        name: params.theater.name.ja
                    },
                    itemOffered: {
                        numSeats: 1,
                        price: asset.sale_price,
                        priceCurrency: factory.priceCurrency.JPY,
                        typeOf: 'Reservation',
                        additionalTicketText: '',
                        modifiedTime: params.closedAt,
                        reservationFor: individualScreeningEvent,
                        reservationNumber: `${params.inquiryKey.reserve_num}-${index.toString()}`,
                        reservationStatus: factory.reservationStatusType.ReservationConfirmed,
                        reservedTicket: {
                            totalPrice: asset.sale_price,
                            coaTicketInfo: coaTicketInfo,
                            dateIssued: params.closedAt,
                            issuedBy: {
                                typeOf: '',
                                name: {
                                    en: '',
                                    ja: ''
                                }
                            },
                            priceCurrency: factory.priceCurrency.JPY,
                            ticketedSeat: {
                                seatingType: '',
                                seatNumber: asset.seat_code,
                                seatRow: '',
                                seatSection: asset.screen_section
                            },
                            ticketNumber: ticketToken,
                            ticketToken: ticketToken,
                            underName: {
                                typeOf: 'Person',
                                name: {
                                    en: customerName,
                                    ja: customerName
                                }
                            }
                        },
                        underName: {
                            typeOf: 'Person',
                            name: {
                                en: customerName,
                                ja: customerName
                            }
                        }
                    }
                };
            }),
        url: '',
        orderStatus: <any>'OrderDelivered',
        paymentMethods: paymentMethods,
        orderDate: params.closedAt,
        isGift: false,
        discounts: [],
        // tslint:disable-next-line:no-suspicious-comment
        // TODO 値補強
        customer: {
            typeOf: 'Person',
            name: customerName,
            url: '',
            id: '',
            givenName: '',
            familyName: '',
            telephone: '',
            email: ''
        },
        orderInquiryKey: {
            theaterCode: params.inquiryKey.theater_code,
            confirmationNumber: params.inquiryKey.reserve_num,
            telephone: params.inquiryKey.tel
        }
    };
}

// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
export function getOldTransactionDetails(transactionId: string) {
    return async (
        transactionRepository: TransactionAdapter,
        filmRepository: FilmAdapter,
        performanceRepository: PerformanceAdapter,
        screenRepository: ScreenAdapter,
        theaterRepository: TheaterAdapter
    ): Promise<ITransactionDetail> => {
        const transactionDoc = await transactionRepository.transactionModel.findById(transactionId).populate('owners').exec();
        if (transactionDoc === null) {
            throw new Error('transaction not found');
        }

        const transaction = <IOldTransaction>transactionDoc.toObject();
        debug('transaction:', transaction);
        const anonymousOwner = <IOldAnonymousOwner>transaction.owners.find(
            (owner) => owner.group === 'ANONYMOUS'
        );
        const authorizations = await transactionRepository.findAuthorizationsById(transaction.id);
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
                        qr: ticket.seatQrcode
                    };
                });
            }
        }

        const performanceDoc = <mongoose.Document>await performanceRepository.model.findById(
            seatReservationAuthorization.assets[0].performance
        )
            .populate('film')
            .populate('theater')
            .populate('screen')
            .exec();
        const performance = <IPerformanceWithReferenceDetails>performanceDoc.toObject();

        const theaterDoc = <mongoose.Document>await theaterRepository.model.findById(performance.theater.id).exec();
        const theater = <ITheater>theaterDoc.toObject();

        const screenDoc = <mongoose.Document>await screenRepository.model.findById(performance.screen.id).exec();
        const screen = <IScreen>screenDoc.toObject();

        const filmDoc = <mongoose.Document>await filmRepository.model.findById(performance.film.id).exec();
        const film = <IFilm>filmDoc.toObject();

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
            seatReservationAuthorization: seatReservationAuthorization,
            gmoAuthorization: gmoAuthorization,
            mvtkAuthorization: mvtkAuthorization,
            qrCodesBySeatCode: qrCodesBySeatCode
        };
    };
}
