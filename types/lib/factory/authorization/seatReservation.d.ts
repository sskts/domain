/**
 * COA座席仮予約ファクトリー
 *
 * @namespace factory/authorization/seatReservation
 */
import * as COA from '@motionpicture/coa-service';
import * as AuthorizationFactory from '../authorization';
import PriceCurrency from '../priceCurrency';
import * as IndividualScreeningEventFactory from '../event/individualScreeningEvent';
import * as ReservationFactory from '../reservation';
/**
 * 承認結果インターフェース
 * COAの仮予約結果に等しい
 */
export declare type IResult = COA.services.reserve.IUpdTmpReserveSeatResult;
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
export declare type IReservation = ReservationFactory.IReservation;
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
export declare function createFromCOATmpReserve(args: {
    price: number;
    updTmpReserveSeatArgs: COA.services.reserve.IUpdTmpReserveSeatArgs;
    reserveSeatsTemporarilyResult: COA.services.reserve.IUpdTmpReserveSeatResult;
    tickets: ReservationFactory.ICOATicketInfo[];
    individualScreeningEvent: IndividualScreeningEventFactory.IEvent;
}): IAuthorization;
