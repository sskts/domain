/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import * as Authorization from '../factory/authorization';
import * as Notification from '../factory/notification';
import * as TransactionEvent from '../factory/transactionEvent';
import TransactionModel from './mongoose/model/transaction';
import TransactionEventModel from './mongoose/model/transactionEvent';
export default class TransactionAdapter {
    readonly connection: Connection;
    transactionModel: typeof TransactionModel;
    transactionEventModel: typeof TransactionEventModel;
    constructor(connection: Connection);
    addEvent(transactionEvent: TransactionEvent.ITransactionEvent): Promise<void>;
    findAuthorizationsById(id: string): Promise<Authorization.IAuthorization[]>;
    findNotificationsById(id: string): Promise<Notification.INotification[]>;
    /**
     * 成立可能かどうか
     *
     * @returns {Promies<boolean>}
     */
    canBeClosed(id: string): Promise<boolean>;
}
