/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import ActionModel from '../mongoose/model/action';
/**
 * print action repository
 * @class
 */
export declare class MongoRepository {
    readonly actionModel: typeof ActionModel;
    constructor(connection: Connection);
    printTicket(agentId: string, ticket: factory.action.transfer.print.ticket.ITicket): Promise<factory.action.transfer.print.IAction>;
    searchPrintTicket(conditions: factory.action.transfer.print.ticket.ISearchConditions): Promise<factory.action.transfer.print.IAction[]>;
}
