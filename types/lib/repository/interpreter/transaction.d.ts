/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Authorization from '../../model/authorization';
import * as Notification from '../../model/notification';
import * as Transaction from '../../model/transaction';
import * as TransactionEvent from '../../model/transactionEvent';
import TransactionRepository from '../transaction';
export default class TransactionRepositoryInterpreter implements TransactionRepository {
    readonly connection: Connection;
    private transactionModel;
    private transactionEventModel;
    constructor(connection: Connection);
    find(conditions: any): Promise<Transaction.ITransaction[]>;
    findById(id: string): Promise<monapt.Option<Transaction.ITransaction>>;
    findOne(conditions: any): Promise<monapt.Option<Transaction.ITransaction>>;
    findOneAndUpdate(conditions: any, update: any): Promise<monapt.Option<Transaction.ITransaction>>;
    store(transaction: Transaction.ITransaction): Promise<void>;
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
