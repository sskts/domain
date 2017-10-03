/**
 * migration v22->v23 service
 * @namespace service.migration
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

import { MongoRepository as EventRepository } from '../repo/event';
import { MongoRepository as OrderRepository } from '../repo/order';
import { MongoRepository as OrganizationRepository } from '../repo/organization';

import FilmAdapter from '../v22/adapter/film';
import PerformanceAdapter from '../v22/adapter/performance';
import ScreenAdapter from '../v22/adapter/screen';
import TransactionAdapter from '../v22/adapter/transaction';

import { IAuthorization as IOldSeatReservationAuthorization } from '../v22/factory/authorization/coaSeatReservation';
import { IAuthorization as IOldGMOAuthorization } from '../v22/factory/authorization/gmo';
import { IAuthorization as IOldMvtkAuthorization } from '../v22/factory/authorization/mvtk';
import { IOwner as IOldAnonymousOwner } from '../v22/factory/owner/anonymous';

import { IFilm } from '../v22/factory/film';
import { IPerformanceWithReferenceDetails } from '../v22/factory/performance';
import { IScreen } from '../v22/factory/screen';

import { ITransaction as IOldTransaction } from '../v22/factory/transaction';
import { ITransactionInquiryKey as IOldTransactionInquiryKey } from '../v22/factory/transactionInquiryKey';

const debug = createDebug('sskts-domain:service:order');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

/**
 * v22取引の詳細インターフェース
 * @export
 * @interface
 * @memberof service.migration
 */
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
    seller: factory.organization.movieTheater.IPublicFields;
    event: factory.event.individualScreeningEvent.IEvent;
    seatReservationAuthorization: IOldSeatReservationAuthorization;
    gmoAuthorization?: IOldGMOAuthorization;
    mvtkAuthorization?: IOldMvtkAuthorization;
    qrCodesBySeatCode: {
        seat_code: string;
        qr: string;
    }[];
}

/**
 * v22の取引データからv23の注文と取引を作成する
 * @export
 * @function
 * @memberof service.migration
 */
export function createFromOldTransaction(transactionId: string) {
    return async (
        eventRepo: EventRepository,
        orderRepo: OrderRepository,
        organizationRepo: OrganizationRepository,
        transactionRepository: TransactionAdapter, // 旧レポジトリー
        filmRepository: FilmAdapter, // 旧レポジトリー
        performanceRepository: PerformanceAdapter, // 旧レポジトリー
        screenRepository: ScreenAdapter // 旧レポジトリー
    ) => {
        const transaction = <IOldTransaction | null>await transactionRepository.transactionModel.findOne({
            _id: transactionId,
            status: 'CLOSED'
        }).exec();

        if (transaction === null) {
            throw new Error('transaction not found');
        }

        // 旧取引データの詳細を取得
        const detail = await getOldTransactionDetails(transaction.id)(
            eventRepo,
            organizationRepo,
            transactionRepository,
            filmRepository,
            performanceRepository,
            screenRepository
        );
        debug('detail:', detail);

        // v23の注文を作成
        const order = createOrder(detail);
        debug('order:', order);

        // orderNumberとorderInquiryKeyだけは間違わないように
        // その他の属性は、最悪後から修正&更新できる
        await orderRepo.orderModel.findOneAndUpdate(
            { orderNumber: order.orderNumber },
            order,
            { upsert: true }
        ).exec();
    };
}

/**
 * create order object from transaction parameters
 * @function
 */
// tslint:disable-next-line:max-func-body-length
function createOrder(params: ITransactionDetail): factory.order.IOrder {
    const paymentMethods: factory.order.IPaymentMethod[] = [];
    const discounts: factory.order.IDiscount[] = [];

    if (params.gmoAuthorization !== undefined) {
        paymentMethods.push({
            name: 'クレジットカード',
            paymentMethod: 'CreditCard',
            paymentMethodId: params.gmoAuthorization.gmo_order_id
        });
    }

    if (params.mvtkAuthorization !== undefined) {
        const discountCode = params.mvtkAuthorization.knyknr_no_info.map(
            (knshInfo) => knshInfo.knyknr_no
        ).join(',');

        discounts.push({
            name: 'ムビチケカード',
            discount: params.mvtkAuthorization.price,
            discountCode: discountCode,
            discountCurrency: factory.priceCurrency.JPY
        });
    }

    const customerName = `${params.anonymous.familyName} ${params.anonymous.givenName}`;
    const individualScreeningEvent = params.event;

    const orderInquiryKey = {
        theaterCode: params.inquiryKey.theater_code,
        confirmationNumber: params.inquiryKey.reserve_num,
        telephone: params.inquiryKey.tel
    };

    const orderNumber = [
        // tslint:disable-next-line:no-magic-numbers
        params.closedAt.toISOString().slice(0, 10),
        orderInquiryKey.theaterCode,
        orderInquiryKey.confirmationNumber
    ].join('-');

    return {
        typeOf: 'Order',
        seller: {
            typeOf: params.seller.typeOf,
            name: params.seller.name.ja,
            url: params.seller.url
        },
        confirmationNumber: orderInquiryKey.confirmationNumber,
        orderNumber: orderNumber,
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
                        typeOf: params.seller.typeOf,
                        name: params.seller.name.ja
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
                            typeOf: 'Ticket',
                            totalPrice: asset.sale_price,
                            coaTicketInfo: coaTicketInfo,
                            dateIssued: params.closedAt,
                            issuedBy: params.event.superEvent.organizer,
                            priceCurrency: factory.priceCurrency.JPY,
                            ticketedSeat: {
                                typeOf: 'Seat',
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
        url: `/inquiry/login?theater=${orderInquiryKey.theaterCode}&reserve=${orderInquiryKey.confirmationNumber}`,
        orderStatus: factory.orderStatus.OrderDelivered,
        paymentMethods: paymentMethods,
        orderDate: params.closedAt,
        isGift: false,
        discounts: discounts,
        customer: {
            typeOf: 'Person',
            name: customerName,
            url: '',
            id: '',
            givenName: params.anonymous.givenName,
            familyName: params.anonymous.familyName,
            telephone: params.anonymous.telephone,
            email: params.anonymous.email
        },
        orderInquiryKey: orderInquiryKey
    };
}

// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
export function getOldTransactionDetails(transactionId: string) {
    return async (
        eventRepo: EventRepository,
        organizationRepo: OrganizationRepository,
        transactionAdapter: TransactionAdapter,
        filmAdapter: FilmAdapter,
        performanceAdapter: PerformanceAdapter,
        screenAdapter: ScreenAdapter
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
        const authorizations = await transactionAdapter.findAuthorizationsById(transaction.id);
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

            // 本予約済みのはず
            if (stateReserveResult === null) {
                throw new Error('COA本予約が未実行です。');
            }

            qrCodesBySeatCode = stateReserveResult.listTicket.map((ticket) => {
                return {
                    seat_code: ticket.seatNum,
                    qr: ticket.seatQrcode
                };
            });
        }

        const performanceDoc = <mongoose.Document>await performanceAdapter.model.findById(
            seatReservationAuthorization.assets[0].performance
        ).populate('film')
            .populate('theater')
            .populate('screen')
            .exec();
        const performance = <IPerformanceWithReferenceDetails>performanceDoc.toObject();

        const screenDoc = <mongoose.Document>await screenAdapter.model.findById(performance.screen.id).exec();
        const screen = <IScreen>screenDoc.toObject();

        const filmDoc = <mongoose.Document>await filmAdapter.model.findById(performance.film.id).exec();
        const film = <IFilm>filmDoc.toObject();
        // v23でのイベント識別子
        const eventIdentifier = [
            performance.theater.id,
            film.coa_title_code,
            film.coa_title_branch_num,
            performance.day,
            screen.coa_screen_code,
            performance.time_start
        ].join('');
        const event = await eventRepo.findIndividualScreeningEventByIdentifier(eventIdentifier);

        const organization = await organizationRepo.findMovieTheaterByBranchCode(performance.theater.id);

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
            seller: organization,
            event: event,
            seatReservationAuthorization: seatReservationAuthorization,
            gmoAuthorization: gmoAuthorization,
            mvtkAuthorization: mvtkAuthorization,
            qrCodesBySeatCode: qrCodesBySeatCode
        };
    };
}
