/// <reference types="mongoose" />
/**
 * タスクファンクションサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 * @namespace service/taskFunctions
 */
import * as factory from '@motionpicture/sskts-factory';
import * as mongoose from 'mongoose';
export declare type IOperation<T> = (connection: mongoose.Connection) => Promise<T>;
export declare function sendEmailNotification(data: factory.task.sendEmailNotification.IData): IOperation<void>;
export declare function cancelSeatReservation(data: factory.task.cancelSeatReservation.IData): IOperation<void>;
export declare function cancelGMO(data: factory.task.cancelGMO.IData): IOperation<void>;
export declare function cancelMvtk(data: factory.task.cancelMvtk.IData): IOperation<void>;
export declare function settleSeatReservation(data: factory.task.settleSeatReservation.IData): IOperation<void>;
export declare function settleGMO(data: factory.task.settleGMO.IData): IOperation<void>;
export declare function settleMvtk(data: factory.task.settleMvtk.IData): IOperation<void>;
export declare function createOrder(data: factory.task.createOrder.IData): IOperation<void>;
