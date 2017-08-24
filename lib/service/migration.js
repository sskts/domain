"use strict";
/**
 * migration v22->v23 service
 * @namespace service/migration
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const moment = require("moment");
const debug = createDebug('sskts-domain:service:order');
function createFromOldTransaction(transactionId) {
    return (orderAdapter, transactionAdapter, filmAdapter, performanceAdapter, screenAdapter, theaterAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionAdapter.transactionModel.findOne({
            _id: transactionId,
            status: 'CLOSED'
        }).exec();
        if (transaction === null) {
            throw new Error('transaction not found');
        }
        const detail = yield getOldTransactionDetails(transaction.id)(transactionAdapter, filmAdapter, performanceAdapter, screenAdapter, theaterAdapter);
        debug('detail:', detail);
        const order = createOrder(detail);
        debug('order:', order);
        yield orderAdapter.orderModel.findOneAndUpdate({
            orderNumber: order.orderNumber
        }, order, { upsert: true }).exec();
    });
}
exports.createFromOldTransaction = createFromOldTransaction;
/**
 * create order object from transaction parameters
 * @function
 * @memberof factory/order
 */
// tslint:disable-next-line:max-func-body-length
function createOrder(params) {
    const paymentMethods = [];
    if (params.gmoAuthorization !== undefined) {
        paymentMethods.push({
            name: 'クレジットカード',
            paymentMethod: 'CreditCard',
            paymentMethodId: params.gmoAuthorization.gmo_order_id
        });
    }
    else if (params.mvtkAuthorization !== undefined) {
        // tslint:disable-next-line:no-suspicious-comment
        // TODO discounts
    }
    else {
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
    const customerName = `${params.anonymous.familyName} ${params.anonymous.givenName}`;
    const individualScreeningEvent = {
        identifier: identifier,
        typeOf: factory.eventType.IndividualScreeningEvent,
        name: params.film.name,
        endDate: moment(`${params.performance.day} ${params.performance.time_end} +09:00`, 'YYYYMMDD HHmm Z').toDate(),
        startDate: moment(`${params.performance.day} ${params.performance.time_start} +09:00`, 'YYYYMMDD HHmm Z').toDate(),
        eventStatus: 'EventScheduled',
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
            eventStatus: 'EventScheduled',
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
        priceCurrency: 'JPY',
        price: (params.gmoAuthorization === undefined) ? 0 : params.gmoAuthorization.price,
        acceptedOffers: params.seatReservationAuthorization.assets.map((asset, index) => {
            const qrCodeInfo = params.qrCodesBySeatCode.find((qrCode) => qrCode.seat_code === asset.seat_code);
            if (qrCodeInfo === undefined) {
                throw new Error('qr not found');
            }
            const ticketToken = qrCodeInfo.qr;
            const coaTicketInfo = {
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
            return {
                numSeats: 1,
                price: asset.sale_price,
                priceCurrency: 'JPY',
                typeOf: 'Reservation',
                additionalTicketText: '',
                modifiedTime: params.closedAt,
                reservationFor: individualScreeningEvent,
                reservationNumber: `${params.inquiryKey.reserve_num}-${index.toString()}`,
                reservationStatus: factory.reservationStatusType.ReservationConfirmed,
                reservedTicket: {
                    coaTicketInfo: coaTicketInfo,
                    dateIssued: params.closedAt,
                    issuedBy: {
                        typeOf: '',
                        name: ''
                    },
                    priceCurrency: 'JPY',
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
                        name: customerName
                    }
                },
                underName: {
                    typeOf: 'Person',
                    name: customerName
                }
            };
        }),
        url: '',
        orderStatus: 'OrderDelivered',
        paymentMethods: paymentMethods,
        orderDate: params.closedAt,
        isGift: false,
        discounts: [],
        customer: {
            name: customerName,
            url: ''
        },
        orderInquiryKey: {
            theaterCode: params.inquiryKey.theater_code,
            orderNumber: params.inquiryKey.reserve_num,
            telephone: params.inquiryKey.tel
        }
    };
}
// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
function getOldTransactionDetails(transactionId) {
    return (transactionAdapter, filmAdapter, performanceAdapter, screenAdapter, theaterAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transactionDoc = yield transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (transactionDoc === null) {
            throw new Error('transaction not found');
        }
        const transaction = transactionDoc.toObject();
        debug('transaction:', transaction);
        const anonymousOwner = transaction.owners.find((owner) => owner.group === 'ANONYMOUS');
        const authorizations = yield transactionAdapter.findAuthorizationsById(transaction.id);
        // GMOオーソリを取り出す
        const gmoAuthorization = authorizations.find((authorization) => authorization.group === 'GMO');
        // ムビチケオーソリを取り出す
        const mvtkAuthorization = authorizations.find((authorization) => authorization.group === 'MVTK');
        // 座席予約オーソリを取り出す
        const seatReservationAuthorization = authorizations.find((authorization) => authorization.group === 'COA_SEAT_RESERVATION');
        let qrCodesBySeatCode = [];
        if (transaction.inquiry_key !== undefined) {
            // COAからQRを取得
            const stateReserveResult = yield COA.services.reserve.stateReserve({
                theaterCode: transaction.inquiry_key.theater_code,
                reserveNum: transaction.inquiry_key.reserve_num,
                telNum: transaction.inquiry_key.tel
            });
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
        const performanceDoc = yield performanceAdapter.model.findById(seatReservationAuthorization.assets[0].performance)
            .populate('film')
            .populate('theater')
            .populate('screen')
            .exec();
        const performance = performanceDoc.toObject();
        const theaterDoc = yield theaterAdapter.model.findById(performance.theater.id).exec();
        const theater = theaterDoc.toObject();
        const screenDoc = yield screenAdapter.model.findById(performance.screen.id).exec();
        const screen = screenDoc.toObject();
        const filmDoc = yield filmAdapter.model.findById(performance.film.id).exec();
        const film = filmDoc.toObject();
        return {
            id: transaction.id,
            closedAt: transaction.closed_at,
            status: transaction.status,
            inquiryKey: transaction.inquiry_key,
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
    });
}
exports.getOldTransactionDetails = getOldTransactionDetails;
