import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';

import ActionModel from '../mongoose/model/action';

/**
 * print action repository
 * @class
 */
export class MongoRepository {
    public readonly actionModel: typeof ActionModel;

    constructor(connection: Connection) {
        this.actionModel = connection.model(ActionModel.modelName);
    }

    public async printTicket(
        agentId: string,
        ticket: factory.action.transfer.print.ticket.ITicket
    ): Promise<factory.action.transfer.print.IAction> {
        const now = new Date();
        const actionAttributes = factory.action.transfer.print.ticket.createAttributes({
            actionStatus: factory.actionStatusType.CompletedActionStatus,
            object: {
                typeOf: 'Ticket',
                ticketToken: ticket.ticketToken
            },
            agent: {
                typeOf: factory.personType.Person,
                id: agentId
            },
            startDate: now,
            endDate: now
        });

        return this.actionModel.create(actionAttributes).then((doc) => <factory.action.transfer.print.IAction>doc.toObject());
    }

    public async searchPrintTicket(
        conditions: factory.action.transfer.print.ticket.ISearchConditions
    ): Promise<factory.action.transfer.print.IAction[]> {
        return this.actionModel.find(
            {
                typeOf: factory.actionType.PrintAction,
                'agent.id': conditions.agentId,
                'object.typeOf': 'Ticket',
                'object.ticketToken': conditions.ticketToken
            }
        ).then((docs) => docs.map((doc) => <factory.action.transfer.print.IAction>doc.toObject()));
    }
}
