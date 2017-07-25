/// <reference types="mongoose" />
import * as mongoose from 'mongoose';
import * as CancelGMOTaskFactory from '../factory/task/cancelGMO';
import * as CancelMvtkTaskFactory from '../factory/task/cancelMvtk';
import * as CancelSeatReservationTaskFactory from '../factory/task/cancelSeatReservation';
import * as CreateOrderTaskFactory from '../factory/task/createOrder';
import * as SendEmailNotificationTaskFactory from '../factory/task/sendEmailNotification';
import * as SettleGMOTaskFactory from '../factory/task/settleGMO';
import * as SettleMvtkTaskFactory from '../factory/task/settleMvtk';
import * as SettleSeatReservationTaskFactory from '../factory/task/settleSeatReservation';
export declare type IOperation<T> = (connection: mongoose.Connection) => Promise<T>;
export declare function sendEmailNotification(data: SendEmailNotificationTaskFactory.IData): IOperation<void>;
export declare function cancelSeatReservation(data: CancelSeatReservationTaskFactory.IData): IOperation<void>;
export declare function cancelGMO(data: CancelGMOTaskFactory.IData): IOperation<void>;
export declare function cancelMvtk(data: CancelMvtkTaskFactory.IData): IOperation<void>;
export declare function settleSeatReservation(data: SettleSeatReservationTaskFactory.IData): IOperation<void>;
export declare function settleGMO(data: SettleGMOTaskFactory.IData): IOperation<void>;
export declare function settleMvtk(data: SettleMvtkTaskFactory.IData): IOperation<void>;
export declare function createOrder(data: CreateOrderTaskFactory.IData): IOperation<void>;
