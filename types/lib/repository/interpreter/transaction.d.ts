/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import Authorization from '../../model/authorization';
import Notification from '../../model/notification';
import Transaction from '../../model/transaction';
import TransactionEvent from '../../model/transactionEvent';
import TransactionRepository from '../transaction';
export declare type IAuthorization = Authorization.AssetAuthorization | Authorization.COASeatReservationAuthorization | Authorization.GMOAuthorization;
export declare type INotification = Notification.EmailNotification;
export default class TransactionRepositoryInterpreter implements TransactionRepository {
    readonly connection: Connection;
    private transactionModel;
    private transactionEventModel;
    constructor(connection: Connection);
    find(conditions: any): Promise<Transaction[]>;
    findById(id: string): Promise<monapt.Option<Transaction>>;
    findOne(conditions: any): Promise<monapt.Option<Transaction>>;
    findOneAndUpdate(conditions: any, update: any): Promise<monapt.Option<Transaction>>;
    store(transaction: Transaction): Promise<void>;
    addEvent(transactionEvent: TransactionEvent): Promise<void>;
    findAuthorizationsById(id: string): Promise<IAuthorization[]>;
    findNotificationsById(id: string): Promise<INotification[]>;
    /**
     * 成立可能かどうか
     *
     * @returns {Promies<boolean>}
     */
    canBeClosed(id: string): Promise<boolean>;
}
