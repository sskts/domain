/**
 * COA座席仮予約ファクトリー
 *
 * @namespace factory/authorization/seatReservation
 */
import * as COA from '@motionpicture/coa-service';
import * as AuthorizationFactory from '../authorization';
import PriceCurrency from '../priceCurrency';
import * as IndivisualScreeningEventFactory from '../event/indivisualScreeningEvent';
import * as ReservationFactory from '../reservation';
export declare type IResult = COA.services.reserve.IUpdTmpReserveSeatResult;
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
export declare type IReservation = ReservationFactory.IReservation;
/**
 * COA座席仮予約
 */
export interface IAuthorization extends AuthorizationFactory.IAuthorization {
    result: IResult;
    object: IObject;
}
export declare function createFromCOATmpReserve(args: {
    price: number;
    updTmpReserveSeatArgs: COA.services.reserve.IUpdTmpReserveSeatArgs;
    reserveSeatsTemporarilyResult: COA.services.reserve.IUpdTmpReserveSeatResult;
    tickets: COA.services.reserve.IUpdReserveTicket[];
    indivisualScreeningEvent: IndivisualScreeningEventFactory.IEvent;
}): IAuthorization;
