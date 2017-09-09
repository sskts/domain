import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';

import ActionModel from './mongoose/model/action';

/**
 * action repository
 * @class
 */
export class MongoRepository {
    public readonly actionModel: typeof ActionModel;

    constructor(connection: Connection) {
        this.actionModel = connection.model(ActionModel.modelName);
    }

    public async pushPaymentInfo(
        transactionId: string,
        authorizeAction: factory.action.authorize.creditCard.IAction
    ): Promise<void> {
        await this.actionModel.findByIdAndUpdate(
            transactionId,
            { $push: { 'object.paymentInfos': authorizeAction } }
        ).exec();
    }

    public async pullPaymentInfo(transactionId: string, actionId: string): Promise<void> {
        await this.actionModel.findByIdAndUpdate(
            transactionId,
            { $pull: { 'object.paymentInfos': { id: actionId } } }
        ).exec();
    }

    public async addSeatReservation(
        transactionId: string,
        authorizeAction: factory.action.authorize.seatReservation.IAction
    ): Promise<void> {
        await this.actionModel.findByIdAndUpdate(
            transactionId,
            { 'object.seatReservation': authorizeAction }
        ).exec();
    }

    public async removeSeatReservation(transactionId: string): Promise<void> {
        await this.actionModel.findByIdAndUpdate(
            transactionId,
            { $unset: { 'object.seatReservation': 1 } }
        ).exec();
    }

    public async pushDiscountInfo(
        transactionId: string,
        authorizeAction: factory.action.authorize.mvtk.IAction
    ): Promise<void> {
        await this.actionModel.findByIdAndUpdate(
            transactionId,
            { $push: { 'object.discountInfos': authorizeAction } }
        ).exec();
    }

    public async pullDiscountInfo(transactionId: string, actionId: string): Promise<void> {
        await this.actionModel.findByIdAndUpdate(
            transactionId,
            { $pull: { 'object.discountInfos': { id: actionId } } }
        ).exec();
    }
}
