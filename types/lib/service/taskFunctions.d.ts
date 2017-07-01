/// <reference types="mongoose" />
import * as mongoose from 'mongoose';
import * as CancelGMOAuthorizationTaskFactory from '../factory/task/cancelGMOAuthorization';
import * as CancelMvtkAuthorizationTaskFactory from '../factory/task/cancelMvtkAuthorization';
import * as CancelSeatReservationAuthorizationTaskFactory from '../factory/task/cancelSeatReservationAuthorization';
import * as DisableTransactionInquiryTaskFactory from '../factory/task/disableTransactionInquiry';
import * as SendEmailNotificationTaskFactory from '../factory/task/sendEmailNotification';
import * as SettleGMOAuthorizationTaskFactory from '../factory/task/settleGMOAuthorization';
import * as SettleMvtkAuthorizationTaskFactory from '../factory/task/settleMvtkAuthorization';
import * as SettleSeatReservationAuthorizationTaskFactory from '../factory/task/settleSeatReservationAuthorization';
export declare type IOperation<T> = (connection: mongoose.Connection) => Promise<T>;
export declare function sendEmailNotification(data: SendEmailNotificationTaskFactory.IData): IOperation<void>;
export declare function cancelSeatReservationAuthorization(data: CancelSeatReservationAuthorizationTaskFactory.IData): IOperation<void>;
export declare function cancelGMOAuthorization(data: CancelGMOAuthorizationTaskFactory.IData): IOperation<void>;
export declare function cancelMvtkAuthorization(data: CancelMvtkAuthorizationTaskFactory.IData): IOperation<void>;
export declare function disableTransactionInquiry(data: DisableTransactionInquiryTaskFactory.IData): IOperation<void>;
export declare function settleSeatReservationAuthorization(data: SettleSeatReservationAuthorizationTaskFactory.IData): IOperation<void>;
export declare function settleGMOAuthorization(data: SettleGMOAuthorizationTaskFactory.IData): IOperation<void>;
export declare function settleMvtkAuthorization(data: SettleMvtkAuthorizationTaskFactory.IData): IOperation<void>;
