/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Authorization from '../factory/authorization';
import * as Notification from '../factory/notification';
import * as Transaction from '../factory/transaction';
import * as TransactionEvent from '../factory/transactionEvent';
import TransactionModel from './mongoose/model/transaction';
import TransactionEventModel from './mongoose/model/transactionEvent';
export default class TransactionAdapter {
    readonly connection: Connection;
    transactionModel: typeof TransactionModel;
    transactionEventModel: typeof TransactionEventModel;
    constructor(connection: Connection);
    find(conditions: any): Promise<Transaction.ITransaction[]>;
    findById(id: string): Promise<monapt.Option<Transaction.ITransaction>>;
    findOne(conditions: any): Promise<monapt.Option<Transaction.ITransaction>>;
    findOneAndUpdate(conditions: any, update: any): Promise<monapt.Option<any>>;
    store(transaction: Transaction.ITransaction): Promise<void>;
    create(transactions: Transaction.ITransaction[]): Promise<void>;
    addEvent(transactionEvent: TransactionEvent.ITransactionEvent): Promise<void>;
    findAuthorizationsById(id: string): Promise<Authorization.IAuthorization[]>;
    findNotificationsById(id: string): Promise<Notification.INotification[]>;
    /**
     * 成立可能かどうか
     *
     * @returns {Promies<boolean>}
     */
    canBeClosed(id: string): Promise<boolean>;
    remove(conditions: any): Promise<void>;
}
