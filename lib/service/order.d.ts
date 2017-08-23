import * as factory from '@motionpicture/sskts-factory';
import * as monapt from 'monapt';
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
import { IFilm } from '../oldFactory/film';
import { IPerformanceWithReferenceDetails } from '../oldFactory/performance';
import { IScreen } from '../oldFactory/screen';
import { ITheater } from '../oldFactory/theater';
import { ITransactionInquiryKey as IOldTransactionInquiryKey } from '../oldFactory/transactionInquiryKey';
export declare type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
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
export declare function createFromOldTransaction(transactionId: string): (__: OrderAdapter, transactionAdapter: TransactionAdapter, filmAdapter: FilmAdapter, performanceAdapter: PerformanceAdapter, screenAdapter: ScreenAdapter, theaterAdapter: TheaterAdapter) => Promise<void>;
export declare function getOldTransactionDetails(transactionId: string): (transactionAdapter: TransactionAdapter, filmAdapter: FilmAdapter, performanceAdapter: PerformanceAdapter, screenAdapter: ScreenAdapter, theaterAdapter: TheaterAdapter) => Promise<ITransactionDetail>;
export declare function findAuthorizationsById(transactionId: string): (transactionAdapter: TransactionAdapter) => Promise<IOldAuthorization[]>;
export declare function createFromTransaction(transaction: IPlaceOrderTransaction): (orderAdapter: OrderAdapter) => Promise<void>;
/**
 * 注文内容を照会する
 */
export declare function findByOrderInquiryKey(orderInquiryKey: factory.order.IOrderInquiryKey): (orderAdapter: OrderAdapter) => Promise<monapt.Option<factory.order.IOrder>>;
