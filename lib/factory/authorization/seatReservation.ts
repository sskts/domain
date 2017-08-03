/**
 * COA座席仮予約ファクトリー
 *
 * @namespace factory/authorization/seatReservation
 */

import * as COA from '@motionpicture/coa-service';

import ArgumentError from '../../error/argument';

import * as AuthorizationFactory from '../authorization';
import AuthorizationGroup from '../authorizationGroup';
import ObjectId from '../objectId';
import PriceCurrency from '../priceCurrency';

import * as IndividualScreeningEventFactory from '../event/individualScreeningEvent';
import * as ReservationFactory from '../reservation';
import ReservationStatusType from '../reservationStatusType';

/**
 * 承認結果インターフェース
 * COAの仮予約結果に等しい
 */
export type IResult = COA.services.reserve.IUpdTmpReserveSeatResult;

/**
 * 承認対象
 */
export interface IObject {
    /**
     * COAの仮予約パラメーター
     */
    updTmpReserveSeatArgs: COA.services.reserve.IUpdTmpReserveSeatArgs;
    /**
     * 受け入れられた供給情報
     */
    acceptedOffers: IAcceptedOffer[];
}

/**
 * 供給情報インターフェース
 */
export interface IAcceptedOffer {
    /**
     * 受け入れられた予約情報
     */
    itemOffered: IReservation;
    /**
     * 金額
     */
    price: number;
    /**
     * 通貨
     */
    priceCurrency: PriceCurrency;
    /**
     * 販売者
     */
    seller: {
        name: string;
    };
}

/**
 * 予約インターフェース
 */
export type IReservation = ReservationFactory.IReservation;

/**
 * 座席予約承認インターフェース
 */
export interface IAuthorization extends AuthorizationFactory.IAuthorization {
    /**
     * 承認結果
     */
    result: IResult;
    /**
     * 承認対象
     */
    object: IObject;
}

export function createFromCOATmpReserve(args: {
    price: number;
    updTmpReserveSeatArgs: COA.services.reserve.IUpdTmpReserveSeatArgs;
    reserveSeatsTemporarilyResult: COA.services.reserve.IUpdTmpReserveSeatResult;
    tickets: ReservationFactory.ICOATicketInfo[],
    individualScreeningEvent: IndividualScreeningEventFactory.IEvent
}): IAuthorization {
    return {
        id: ObjectId().toString(),
        group: AuthorizationGroup.COA_SEAT_RESERVATION,
        price: args.price,
        result: args.reserveSeatsTemporarilyResult,
        object: {
            updTmpReserveSeatArgs: args.updTmpReserveSeatArgs,
            acceptedOffers: args.reserveSeatsTemporarilyResult.listTmpReserve.map((tmpReserve, index) => {
                const selectedTicket = args.tickets.find((ticket) => ticket.seatNum === tmpReserve.seatNum);
                if (selectedTicket === undefined) {
                    throw new ArgumentError('tickets');
                }

                // QRコード文字列を手動で作成
                const ticketToken = [
                    args.individualScreeningEvent.coaInfo.theaterCode,
                    args.individualScreeningEvent.coaInfo.dateJouei,
                    // tslint:disable-next-line:no-magic-numbers
                    (`00000000${args.reserveSeatsTemporarilyResult.tmpReserveNum}`).slice(-8),
                    // tslint:disable-next-line:no-magic-numbers
                    (`000${index + 1}`).slice(-3)
                ].join('');

                return {
                    itemOffered: ReservationFactory.create({
                        additionalTicketText: '',
                        modifiedTime: new Date(),
                        numSeats: 1,
                        price: selectedTicket.salePrice,
                        priceCurrency: PriceCurrency.JPY,
                        reservationFor: args.individualScreeningEvent,
                        reservationNumber: `${args.reserveSeatsTemporarilyResult.tmpReserveNum}-${index.toString()}`,
                        reservationStatus: ReservationStatusType.ReservationHold,
                        reservedTicket: {
                            coaTicketInfo: selectedTicket,
                            dateIssued: new Date(),
                            issuedBy: { // todo 値セット
                                typeOf: '',
                                name: ''
                            },
                            priceCurrency: PriceCurrency.JPY,
                            ticketedSeat: {
                                seatingType: '',
                                seatNumber: tmpReserve.seatNum,
                                seatRow: '',
                                seatSection: tmpReserve.seatSection
                            },
                            ticketNumber: ticketToken,
                            ticketToken: ticketToken,
                            underName: {
                                typeOf: 'Person',
                                name: ''
                            }
                        },
                        underName: {
                            typeOf: 'Person',
                            name: ''
                        }
                    }),
                    price: selectedTicket.salePrice,
                    priceCurrency: PriceCurrency.JPY,
                    seller: {
                        name: ''
                    }
                };
            })
        }
    };
}
