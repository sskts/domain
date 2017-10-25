/**
 * migration v22->v23 service
 * @namespace service.migration
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import * as mongoose from 'mongoose';

import { MongoRepository as EventRepository } from '../repo/event';
import { MongoRepository as OrderRepository } from '../repo/order';
import { MongoRepository as OrganizationRepository } from '../repo/organization';
import { MongoRepository as OwnershipInfoRepository } from '../repo/ownershipInfo';

import PerformanceAdapter from '../v22/adapter/performance';
import TransactionAdapter from '../v22/adapter/transaction';

import { IAuthorization as IOldSeatReservationAuthorization } from '../v22/factory/authorization/coaSeatReservation';
import { IAuthorization as IOldGMOAuthorization } from '../v22/factory/authorization/gmo';
import { IAuthorization as IOldMvtkAuthorization } from '../v22/factory/authorization/mvtk';
import { IOwner as IOldAnonymousOwner } from '../v22/factory/owner/anonymous';

import { ITransaction as IOldTransaction } from '../v22/factory/transaction';
import { ITransactionInquiryKey as IOldTransactionInquiryKey } from '../v22/factory/transactionInquiryKey';

const debug = createDebug('sskts-domain:service:migration');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

/**
 * v22取引の詳細インターフェース
 * @export
 * @interface
 * @memberof service.migration
 */
export interface ITransactionDetail {
    id: string;
    expires: Date;
    startDate: Date;
    endDate: Date;
    status: string;
    orderInquiryKey: factory.order.IOrderInquiryKey;
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
    tasksExportedAt: Date;
    tasksExportationStatus: string;
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
        ownershipInfoRepository: OwnershipInfoRepository,
        organizationRepo: OrganizationRepository,
        transactionRepository: TransactionAdapter, // 旧レポジトリー
        performanceRepository: PerformanceAdapter // 旧レポジトリー
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
            performanceRepository
        );
        debug('detail:', detail);

        // v23の注文を作成
        const order = createOrder(detail);
        debug('order:', order);

        const ownershipInfos = order.acceptedOffers.map((acceptedOffer) => {
            // ownershipInfoのidentifierはコレクション内でuniqueである必要があるので、この仕様には要注意
            // ひとまず十分にuniqueにしておく
            const identifier = `${acceptedOffer.itemOffered.typeOf}-${acceptedOffer.itemOffered.reservedTicket.ticketToken}`;

            return factory.ownershipInfo.create({
                identifier: identifier,
                ownedBy: {
                    id: '',
                    typeOf: factory.personType.Person,
                    name: order.customer.name
                },
                acquiredFrom: {
                    typeOf: detail.seller.typeOf,
                    id: detail.seller.id,
                    name: detail.seller.name.ja
                },
                ownedFrom: order.orderDate,
                ownedThrough: order.acceptedOffers[0].itemOffered.reservationFor.endDate,
                typeOfGood: acceptedOffer.itemOffered
            });
        });

        // 注文保管
        // orderNumberとorderInquiryKeyだけは間違わないように
        // その他の属性は、最悪後から修正&更新できる
        await orderRepo.save(order);

        // 所有権保管
        await Promise.all(ownershipInfos.map(async (ownershipInfo) => {
            await ownershipInfoRepository.save(ownershipInfo);
        }));

        // できる限り取引データの型をv23に近づける
        await transactionRepository.transactionModel.findByIdAndUpdate(
            transactionId,
            {
                typeOf: factory.transactionType.PlaceOrder,
                agent: {
                    typeOf: 'Person',
                    id: '',
                    url: ''
                },
                seller: {
                    typeOf: 'MovieTheater',
                    id: detail.seller.id,
                    name: detail.seller.name.ja,
                    url: detail.seller.url
                },
                object: {
                    // clientUser: params.clientUser,
                    // authorizeActions: []
                },
                expires: detail.expires,
                startDate: detail.startDate,
                endDate: detail.endDate,
                result: {
                    order: order,
                    ownershipInfos: ownershipInfos
                },
                tasksExportedAt: detail.tasksExportedAt,
                tasksExportationStatus: detail.tasksExportationStatus
            }
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

    const orderNumber = [
        // tslint:disable-next-line:no-magic-numbers
        params.endDate.toISOString().slice(0, 10),
        params.orderInquiryKey.theaterCode,
        params.orderInquiryKey.confirmationNumber
    ].join('-');

    return {
        typeOf: 'Order',
        seller: {
            typeOf: params.seller.typeOf,
            name: params.seller.name.ja,
            url: params.seller.url
        },
        confirmationNumber: params.orderInquiryKey.confirmationNumber,
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

                const coaTicketInfo: factory.offer.seatReservation.ICOATicketInfoWithDetails = {
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
                        typeOf: 'EventReservation',
                        additionalTicketText: '',
                        modifiedTime: params.endDate,
                        reservationFor: individualScreeningEvent,
                        reservationNumber: `${params.orderInquiryKey.confirmationNumber}-${index.toString()}`,
                        reservationStatus: factory.reservationStatusType.ReservationConfirmed,
                        reservedTicket: {
                            typeOf: 'Ticket',
                            totalPrice: asset.sale_price,
                            coaTicketInfo: coaTicketInfo,
                            dateIssued: params.endDate,
                            issuedBy: params.event.superEvent.organizer,
                            priceCurrency: factory.priceCurrency.JPY,
                            ticketedSeat: {
                                typeOf: factory.placeType.Seat,
                                seatingType: '',
                                seatNumber: asset.seat_code,
                                seatRow: '',
                                seatSection: asset.screen_section
                            },
                            ticketNumber: ticketToken,
                            ticketToken: ticketToken,
                            underName: {
                                typeOf: factory.personType.Person,
                                name: {
                                    en: customerName,
                                    ja: customerName
                                }
                            }
                        },
                        underName: {
                            typeOf: factory.personType.Person,
                            name: {
                                en: customerName,
                                ja: customerName
                            }
                        }
                    }
                };
            }),
        url: `/inquiry/login?theater=${params.orderInquiryKey.theaterCode}&reserve=${params.orderInquiryKey.confirmationNumber}`,
        orderStatus: factory.orderStatus.OrderDelivered,
        paymentMethods: paymentMethods,
        orderDate: params.endDate,
        isGift: false,
        discounts: discounts,
        customer: {
            typeOf: factory.personType.Person,
            name: customerName,
            url: '',
            id: '',
            givenName: params.anonymous.givenName,
            familyName: params.anonymous.familyName,
            telephone: params.anonymous.telephone,
            email: params.anonymous.email
        },
        orderInquiryKey: params.orderInquiryKey
    };
}

// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
export function getOldTransactionDetails(transactionId: string) {
    // tslint:disable-next-line:max-func-body-length
    return async (
        eventRepo: EventRepository,
        organizationRepo: OrganizationRepository,
        transactionAdapter: TransactionAdapter,
        performanceAdapter: PerformanceAdapter
    ): Promise<ITransactionDetail> => {
        const transactionDoc = await transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (transactionDoc === null) {
            throw new Error('transaction not found');
        }

        const transaction = <IOldTransaction>transactionDoc.toObject();
        debug('transaction from v22 is', transaction);
        const anonymousOwner = <IOldAnonymousOwner>transaction.owners.find((owner) => owner.group === 'ANONYMOUS');
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

        const performanceDoc = <mongoose.Document>await performanceAdapter.model.findById(
            seatReservationAuthorization.assets[0].performance
        ).populate('film theater screen').exec();
        const performance = <any>performanceDoc.toObject();
        debug('performance from v22 is', performance);

        let qrCodesBySeatCode: {
            seat_code: string;
            qr: string;
        }[] = [];
        if (transaction.inquiry_key !== undefined) {
            // チケットトークン(QRコード文字列)を作成
            qrCodesBySeatCode = seatReservationAuthorization.assets.map((asset, index) => {
                const ticketToken = [
                    performance.theater.id,
                    performance.day,
                    // tslint:disable-next-line:no-magic-numbers
                    (`00000000${(<IOldTransactionInquiryKey>transaction.inquiry_key).reserve_num}`).slice(-8),
                    // tslint:disable-next-line:no-magic-numbers
                    (`000${index + 1}`).slice(-3)
                ].join('');

                return {
                    seat_code: asset.seat_code,
                    qr: ticketToken
                };
            });
        }

        // v23でのイベント識別子
        const eventIdentifier = [
            performance.theater.id,
            performance.film.coa_title_code,
            performance.film.coa_title_branch_num,
            performance.day,
            performance.screen.coa_screen_code,
            performance.time_start
        ].join('');
        debug('new eventIdentifier is', eventIdentifier);
        const event = await eventRepo.findIndividualScreeningEventByIdentifier(eventIdentifier);

        const organization = await organizationRepo.findMovieTheaterByBranchCode(performance.theater.id);

        // 電話番号フォーマットが間違っていてもスルー(ログは出力しておく)
        let formatedPhoneNumber: string = '';
        try {
            const phoneUtil = PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(anonymousOwner.tel, 'JP');
            debug('isValidNumber:', phoneUtil.isValidNumber(phoneNumber));
            if (!phoneUtil.isValidNumber(phoneNumber)) {
                console.error('Invalid phone number format.', anonymousOwner.tel, transaction.id);
            }

            formatedPhoneNumber = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
        } catch (error) {
            console.error(error, 'Invalid phone number format.', anonymousOwner.tel, transaction.id);
        }

        const orderInquiryKey = {
            theaterCode: (<IOldTransactionInquiryKey>transaction.inquiry_key).theater_code,
            confirmationNumber: (<IOldTransactionInquiryKey>transaction.inquiry_key).reserve_num,
            telephone: formatedPhoneNumber
        };

        return {
            id: transaction.id,
            expires: <Date>transaction.expires_at,
            startDate: <Date>transaction.started_at,
            endDate: <Date>transaction.closed_at,
            status: transaction.status,
            orderInquiryKey: orderInquiryKey,
            anonymous: {
                givenName: anonymousOwner.name_first,
                familyName: anonymousOwner.name_last,
                email: anonymousOwner.email,
                telephone: formatedPhoneNumber
            },
            seller: organization,
            event: event,
            seatReservationAuthorization: seatReservationAuthorization,
            gmoAuthorization: gmoAuthorization,
            mvtkAuthorization: mvtkAuthorization,
            qrCodesBySeatCode: qrCodesBySeatCode,
            tasksExportedAt: <Date>transaction.tasks_exported_at,
            tasksExportationStatus: transaction.tasks_exportation_status
        };
    };
}
