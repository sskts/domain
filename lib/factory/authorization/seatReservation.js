"use strict";
/**
 * COA座席仮予約ファクトリー
 *
 * @namespace factory/authorization/seatReservation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const argument_1 = require("../../error/argument");
const authorizationGroup_1 = require("../authorizationGroup");
const objectId_1 = require("../objectId");
const priceCurrency_1 = require("../priceCurrency");
const ReservationFactory = require("../reservation");
const reservationStatusType_1 = require("../reservationStatusType");
function createFromCOATmpReserve(args) {
    return {
        id: objectId_1.default().toString(),
        group: authorizationGroup_1.default.COA_SEAT_RESERVATION,
        price: args.price,
        result: args.reserveSeatsTemporarilyResult,
        object: {
            updTmpReserveSeatArgs: args.updTmpReserveSeatArgs,
            acceptedOffer: args.reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve, index) => {
                const selectedTicket = args.tickets.find((ticket) => ticket.seat_num === tmpReserve.seat_num);
                if (selectedTicket === undefined) {
                    throw new argument_1.default('tickets');
                }
                // QRコード文字列を手動で作成
                const ticketToken = [
                    args.indivisualScreeningEvent.coaInfo.theaterCode,
                    args.indivisualScreeningEvent.coaInfo.dateJouei,
                    // tslint:disable-next-line:no-magic-numbers
                    (`00000000${args.reserveSeatsTemporarilyResult.tmp_reserve_num}`).slice(-8),
                    // tslint:disable-next-line:no-magic-numbers
                    (`000${index + 1}`).slice(-3)
                ].join('');
                return {
                    itemOffered: ReservationFactory.create({
                        additionalTicketText: '',
                        modifiedTime: new Date(),
                        numSeats: 1,
                        price: selectedTicket.sale_price,
                        priceCurrency: priceCurrency_1.default.JPY,
                        reservationFor: args.indivisualScreeningEvent,
                        reservationNumber: `${args.reserveSeatsTemporarilyResult.tmp_reserve_num}-${index.toString()}`,
                        reservationStatus: reservationStatusType_1.default.ReservationHold,
                        reservedTicket: {
                            coaTicketInfo: selectedTicket,
                            dateIssued: new Date(),
                            issuedBy: {
                                typeOf: '',
                                name: ''
                            },
                            priceCurrency: priceCurrency_1.default.JPY,
                            ticketedSeat: {
                                seatingType: '',
                                seatNumber: tmpReserve.seat_num,
                                seatRow: '',
                                seatSection: tmpReserve.seat_section
                            },
                            ticketNumber: ticketToken,
                            ticketToken: ticketToken,
                            totalPrice: selectedTicket.sale_price,
                            underName: {
                                typeOf: 'Person',
                                name: ''
                            }
                        },
                        totalPrice: selectedTicket.sale_price,
                        underName: {
                            typeOf: 'Person',
                            name: ''
                        }
                    }),
                    price: selectedTicket.sale_price,
                    priceCurrency: priceCurrency_1.default.JPY,
                    seller: {
                        name: ''
                    }
                };
            })
        }
    };
}
exports.createFromCOATmpReserve = createFromCOATmpReserve;
