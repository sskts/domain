/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import ActionModel from '../mongoose/model/action';
export declare type IObject = factory.action.authorize.creditCard.IObject | factory.action.authorize.mvtk.IObject | factory.action.authorize.seatReservation.IObject;
/**
 * authorize action repository
 * @class
 */
export declare class MongoRepository {
    readonly actionModel: typeof ActionModel;
    constructor(connection: Connection);
    startCreditCard(agent: factory.action.IParticipant, recipient: factory.action.IParticipant, object: factory.action.authorize.creditCard.IObject): Promise<factory.action.authorize.creditCard.IAction>;
    completeCreditCard(actionId: string, result: factory.action.authorize.creditCard.IResult): Promise<factory.action.authorize.creditCard.IAction>;
    cancelCreditCard(actionId: string, transactionId: string): Promise<factory.action.authorize.creditCard.IAction>;
    startMvtk(agent: factory.action.IParticipant, recipient: factory.action.IParticipant, object: factory.action.authorize.mvtk.IObject): Promise<factory.action.authorize.creditCard.IAction>;
    completeMvtk(actionId: string, result: factory.action.authorize.mvtk.IResult): Promise<factory.action.authorize.mvtk.IAction>;
    cancelMvtk(actionId: string, transactionId: string): Promise<factory.action.authorize.mvtk.IAction>;
    startSeatReservation(agent: factory.action.IParticipant, recipient: factory.action.IParticipant, object: factory.action.authorize.seatReservation.IObject): Promise<factory.action.authorize.creditCard.IAction>;
    completeSeatReservation(actionId: string, result: factory.action.authorize.seatReservation.IResult): Promise<factory.action.authorize.seatReservation.IAction>;
    cancelSeatReservation(actionId: string, transactionId: string): Promise<factory.action.authorize.seatReservation.IAction>;
    findSeatReservationByTransactionId(transactionId: string): Promise<factory.action.authorize.seatReservation.IAction>;
    giveUp(actionId: string, error: any): Promise<factory.action.authorize.IAction>;
    findByTransactionId(transactionId: string): Promise<factory.action.authorize.IAction[]>;
}
