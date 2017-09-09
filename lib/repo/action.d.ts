/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import ActionModel from './mongoose/model/action';
/**
 * action repository
 * @class
 */
export declare class MongoRepository {
    readonly actionModel: typeof ActionModel;
    constructor(connection: Connection);
    pushPaymentInfo(transactionId: string, authorizeAction: factory.action.authorize.creditCard.IAction): Promise<void>;
    pullPaymentInfo(transactionId: string, actionId: string): Promise<void>;
    addSeatReservation(transactionId: string, authorizeAction: factory.action.authorize.seatReservation.IAction): Promise<void>;
    removeSeatReservation(transactionId: string): Promise<void>;
    pushDiscountInfo(transactionId: string, authorizeAction: factory.action.authorize.mvtk.IAction): Promise<void>;
    pullDiscountInfo(transactionId: string, actionId: string): Promise<void>;
}
