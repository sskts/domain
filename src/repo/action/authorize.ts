import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';

import ActionModel from '../mongoose/model/action';

export type IObject =
    factory.action.authorize.creditCard.IObject |
    factory.action.authorize.mvtk.IObject |
    factory.action.authorize.seatReservation.IObject;

/**
 * authorize action repository
 * @class
 */
export class MongoRepository {
    public readonly actionModel: typeof ActionModel;

    constructor(connection: Connection) {
        this.actionModel = connection.model(ActionModel.modelName);
    }

    public async startCreditCard(
        agent: factory.action.IParticipant,
        recipient: factory.action.IParticipant,
        object: factory.action.authorize.creditCard.IObject
    ): Promise<factory.action.authorize.creditCard.IAction> {
        const actionAttributes = factory.action.authorize.creditCard.createAttributes({
            actionStatus: factory.actionStatusType.ActiveActionStatus,
            object: object,
            agent: agent,
            recipient: recipient,
            startDate: new Date()
        });

        return await this.actionModel.create(actionAttributes).then(
            (doc) => <factory.action.authorize.creditCard.IAction>doc.toObject()
        );
    }

    public async completeCreditCard(
        actionId: string,
        result: factory.action.authorize.creditCard.IResult
    ): Promise<factory.action.authorize.creditCard.IAction> {
        return await this.actionModel.findByIdAndUpdate(
            actionId,
            {
                actionStatus: factory.actionStatusType.CompletedActionStatus,
                result: result,
                endDate: new Date()
            },
            { new: true }
        ).exec().then((doc) => {
            if (doc === null) {
                throw new factory.errors.NotFound('authorizeAction');
            }

            return <factory.action.authorize.creditCard.IAction>doc.toObject();
        });
    }

    public async cancelCreditCard(
        actionId: string,
        transactionId: string
    ): Promise<factory.action.authorize.creditCard.IAction> {
        return await this.actionModel.findOneAndUpdate(
            {
                _id: actionId,
                typeOf: factory.actionType.AuthorizeAction,
                'object.transactionId': transactionId,
                'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.CreditCard
            },
            { actionStatus: factory.actionStatusType.CanceledActionStatus },
            { new: true }
        ).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('authorizeAction');

                }

                return <factory.action.authorize.creditCard.IAction>doc.toObject();
            });
    }

    public async startMvtk(
        agent: factory.action.IParticipant,
        recipient: factory.action.IParticipant,
        object: factory.action.authorize.mvtk.IObject
    ): Promise<factory.action.authorize.creditCard.IAction> {
        const actionAttributes = factory.action.authorize.mvtk.createAttributes({
            actionStatus: factory.actionStatusType.ActiveActionStatus,
            object: object,
            agent: agent,
            recipient: recipient,
            startDate: new Date()
        });

        return await this.actionModel.create(actionAttributes).then(
            (doc) => <factory.action.authorize.creditCard.IAction>doc.toObject()
        );
    }

    public async completeMvtk(
        actionId: string,
        result: factory.action.authorize.mvtk.IResult
    ): Promise<factory.action.authorize.mvtk.IAction> {
        return await this.actionModel.findByIdAndUpdate(
            actionId,
            {
                actionStatus: factory.actionStatusType.CompletedActionStatus,
                result: result,
                endDate: new Date()
            },
            { new: true }
        ).exec().then((doc) => {
            if (doc === null) {
                throw new factory.errors.NotFound('authorizeAction');
            }

            return <factory.action.authorize.mvtk.IAction>doc.toObject();
        });
    }

    public async cancelMvtk(
        actionId: string,
        transactionId: string
    ): Promise<factory.action.authorize.mvtk.IAction> {
        return await this.actionModel.findOneAndUpdate(
            {
                _id: actionId,
                typeOf: factory.actionType.AuthorizeAction,
                'object.transactionId': transactionId,
                'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.Mvtk
            },
            { actionStatus: factory.actionStatusType.CanceledActionStatus },
            { new: true }
        ).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('authorizeAction');

                }

                return <factory.action.authorize.mvtk.IAction>doc.toObject();
            });
    }

    public async startSeatReservation(
        agent: factory.action.IParticipant,
        recipient: factory.action.IParticipant,
        object: factory.action.authorize.seatReservation.IObject
    ): Promise<factory.action.authorize.creditCard.IAction> {
        const actionAttributes = factory.action.authorize.seatReservation.createAttributes({
            actionStatus: factory.actionStatusType.ActiveActionStatus,
            object: object,
            agent: agent,
            recipient: recipient,
            startDate: new Date()
        });

        return await this.actionModel.create(actionAttributes).then(
            (doc) => <factory.action.authorize.creditCard.IAction>doc.toObject()
        );
    }

    public async completeSeatReservation(
        actionId: string,
        result: factory.action.authorize.seatReservation.IResult
    ): Promise<factory.action.authorize.seatReservation.IAction> {
        return await this.actionModel.findByIdAndUpdate(
            actionId,
            {
                actionStatus: factory.actionStatusType.CompletedActionStatus,
                result: result,
                endDate: new Date()
            },
            { new: true }
        ).exec().then((doc) => {
            if (doc === null) {
                throw new factory.errors.NotFound('authorizeAction');
            }

            return <factory.action.authorize.seatReservation.IAction>doc.toObject();
        });
    }

    public async cancelSeatReservation(
        actionId: string,
        transactionId: string
    ): Promise<factory.action.authorize.seatReservation.IAction> {
        return await this.actionModel.findOneAndUpdate(
            {
                _id: actionId,
                typeOf: factory.actionType.AuthorizeAction,
                'object.transactionId': transactionId,
                'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.SeatReservation
            },
            { actionStatus: factory.actionStatusType.CanceledActionStatus },
            { new: true }
        ).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new factory.errors.NotFound('authorizeAction');

                }

                return <factory.action.authorize.seatReservation.IAction>doc.toObject();
            });
    }

    public async findSeatReservationByTransactionId(
        transactionId: string
    ): Promise<factory.action.authorize.seatReservation.IAction> {
        return await this.actionModel.findOne({
            'object.transactionId': transactionId,
            'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.SeatReservation,
            typeOf: factory.actionType.AuthorizeAction,
            actionStatus: factory.actionStatusType.CompletedActionStatus
        }).exec().then((doc) => {
            if (doc === null) {
                throw new factory.errors.NotFound('seatReservation authorizeAction');
            }

            return <factory.action.authorize.seatReservation.IAction>doc.toObject();
        });
    }

    public async giveUp(
        actionId: string,
        error: any
    ): Promise<factory.action.authorize.IAction> {
        return await this.actionModel.findByIdAndUpdate(
            actionId,
            {
                actionStatus: factory.actionStatusType.FailedActionStatus,
                error: error,
                endDate: new Date()
            },
            { new: true }
        ).exec().then((doc) => {
            if (doc === null) {
                throw new factory.errors.NotFound('authorizeAction');
            }

            return <factory.action.authorize.IAction>doc.toObject();
        });
    }

    public async findByTransactionId(transactionId: string): Promise<factory.action.authorize.IAction[]> {
        return await this.actionModel.find({
            'object.transactionId': transactionId,
            typeOf: factory.actionType.AuthorizeAction
        }).exec().then((docs) => docs.map((doc) => <factory.action.authorize.IAction>doc.toObject()));
    }
}
