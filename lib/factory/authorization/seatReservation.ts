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

export type IResult = COA.services.reserve.IUpdTmpReserveSeatResult;

/**
 * 承認対象
 * 受け入れられた供給情報
 */
export interface IObject {
    updTmpReserveSeatArgs: COA.services.reserve.IUpdTmpReserveSeatArgs;
    acceptedOffer: IAcceptedOffer[];
}

export interface IAcceptedOffer {
    itemOffered: IReservation;
    price: number;
    priceCurrency: PriceCurrency;
    seller: {
        name: string;
    };
}

export type IReservation = ReservationFactory.IReservation;

/**
 * COA座席仮予約
 */
export interface IAuthorization extends AuthorizationFactory.IAuthorization {
    result: IResult;
    object: IObject;
}

export function createFromCOATmpReserve(args: {
    price: number;
    updTmpReserveSeatArgs: COA.services.reserve.IUpdTmpReserveSeatArgs;
    reserveSeatsTemporarilyResult: COA.services.reserve.IUpdTmpReserveSeatResult;
    tickets: COA.services.reserve.IUpdReserveTicket[],
    individualScreeningEvent: IndividualScreeningEventFactory.IEvent
}): IAuthorization {
    return {
        id: ObjectId().toString(),
        group: AuthorizationGroup.COA_SEAT_RESERVATION,
        price: args.price,
        result: args.reserveSeatsTemporarilyResult,
        object: {
            updTmpReserveSeatArgs: args.updTmpReserveSeatArgs,
            acceptedOffer: args.reserveSeatsTemporarilyResult.listTmpReserve.map((tmpReserve, index) => {
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
                            totalPrice: selectedTicket.salePrice,
                            underName: {
                                typeOf: 'Person',
                                name: ''
                            }
                        },
                        totalPrice: selectedTicket.salePrice,
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
