import * as factory from '@motionpicture/sskts-factory';

import { MongoRepository as AuthorizeActionRepository } from '../authorize';

export namespace AuthorizeActionFactory {
    export type IAgent = any;
    export type IRecipient = any;
    export interface IObject {
        transactionId: string;
        price: number;
    }
    export type IAction = any;
    export interface IResult {
        price: number;
        pecorinoTransaction: any;
        pecorinoEndpoint: string;
    }

    export function createAttributes(params: {
        actionStatus: factory.actionStatusType;
        result?: IResult;
        object: IObject;
        agent: IAgent;
        recipient: IRecipient;
        startDate: Date;
        endDate?: Date;
    }) {
        return {
            actionStatus: params.actionStatus,
            typeOf: factory.actionType.AuthorizeAction,
            purpose: {
                typeOf: 'Pecorino'
            },
            result: params.result,
            object: params.object,
            agent: params.agent,
            recipient: params.recipient,
            startDate: params.startDate,
            endDate: params.endDate
        };
    }
}

/**
 * Pecorino承認アクションレポジトリー
 * @export
 * @class
 */
export class MongoRepository extends AuthorizeActionRepository {
    protected readonly purpose: string = 'Pecorino';

    public async start(
        agent: factory.action.IParticipant,
        recipient: factory.action.IParticipant,
        object: AuthorizeActionFactory.IObject
    ): Promise<AuthorizeActionFactory.IAction> {
        const actionAttributes = AuthorizeActionFactory.createAttributes({
            actionStatus: factory.actionStatusType.ActiveActionStatus,
            object: object,
            agent: agent,
            recipient: recipient,
            startDate: new Date()
        });

        return this.actionModel.create(actionAttributes).then(
            (doc) => <AuthorizeActionFactory.IAction>doc.toObject()
        );
    }

    public async complete(
        actionId: string,
        result: AuthorizeActionFactory.IResult
    ): Promise<AuthorizeActionFactory.IAction> {
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

            return <AuthorizeActionFactory.IAction>doc.toObject();
        });
    }

    public async cancel(
        actionId: string,
        transactionId: string
    ): Promise<AuthorizeActionFactory.IAction> {
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

                return <AuthorizeActionFactory.IAction>doc.toObject();
            });
    }
}
