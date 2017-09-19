import * as factory from '@motionpicture/sskts-factory';
import { MongoRepository as OrderRepository } from '../repo/order';
import FilmAdapter from '../v22/adapter/film';
import PerformanceAdapter from '../v22/adapter/performance';
import ScreenAdapter from '../v22/adapter/screen';
import TheaterAdapter from '../v22/adapter/theater';
import TransactionAdapter from '../v22/adapter/transaction';
import { IAuthorization as IOldSeatReservationAuthorization } from '../v22/factory/authorization/coaSeatReservation';
import { IAuthorization as IOldGMOAuthorization } from '../v22/factory/authorization/gmo';
import { IAuthorization as IOldMvtkAuthorization } from '../v22/factory/authorization/mvtk';
import { IFilm } from '../v22/factory/film';
import { IPerformanceWithReferenceDetails } from '../v22/factory/performance';
import { IScreen } from '../v22/factory/screen';
import { ITheater } from '../v22/factory/theater';
import { ITransactionInquiryKey as IOldTransactionInquiryKey } from '../v22/factory/transactionInquiryKey';
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
    seatReservationAuthorization: IOldSeatReservationAuthorization;
    gmoAuthorization?: IOldGMOAuthorization;
    mvtkAuthorization?: IOldMvtkAuthorization;
    qrCodesBySeatCode: {
        seat_code: string;
        qr: string;
    }[];
}
export declare function createFromOldTransaction(transactionId: string): (orderRepository: OrderRepository, transactionRepository: TransactionAdapter, filmRepository: FilmAdapter, performanceRepository: PerformanceAdapter, screenRepository: ScreenAdapter, theaterRepository: TheaterAdapter) => Promise<void>;
export declare function getOldTransactionDetails(transactionId: string): (transactionRepository: TransactionAdapter, filmRepository: FilmAdapter, performanceRepository: PerformanceAdapter, screenRepository: ScreenAdapter, theaterRepository: TheaterAdapter) => Promise<ITransactionDetail>;
