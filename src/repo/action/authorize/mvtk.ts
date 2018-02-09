import * as factory from '@motionpicture/sskts-factory';

import { MongoRepository as AuthorizeActionRepository } from '../authorize';

/**
 * ムビチケ承認アクションレポジトリー
 * @export
 * @class
 */
export class MongoRepository extends AuthorizeActionRepository {
    protected readonly purpose: string = factory.action.authorize.authorizeActionPurpose.Mvtk;

    public async start(
        agent: factory.action.IParticipant,
        recipient: factory.action.IParticipant,
        object: factory.action.authorize.mvtk.IObject
    ): Promise<factory.action.authorize.creditCard.IAction> {
        const actionAttributes = factory.action.authorize.mvtk.createAttributes({
            object: object,
            agent: agent,
            recipient: recipient
        });

        return this.actionModel.create({
            ...actionAttributes,
            actionStatus: factory.actionStatusType.ActiveActionStatus,
            startDate: new Date()
        }).then((doc) => <factory.action.authorize.creditCard.IAction>doc.toObject());
    }

    public async complete(
        actionId: string,
        result: factory.action.authorize.mvtk.IResult
    ): Promise<factory.action.authorize.mvtk.IAction> {
        return this.actionModel.findByIdAndUpdate(
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

    public async cancel(
        actionId: string,
        transactionId: string
    ): Promise<factory.action.authorize.mvtk.IAction> {
        return this.actionModel.findOneAndUpdate(
            {
                _id: actionId,
                typeOf: factory.actionType.AuthorizeAction,
                'object.transactionId': transactionId,
                'purpose.typeOf': this.purpose
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
}
