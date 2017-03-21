/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import * as Authorization from '../factory/authorization';
import * as Notification from '../factory/notification';
import * as TransactionEvent from '../factory/transactionEvent';
import TransactionModel from './mongoose/model/transaction';
import TransactionEventModel from './mongoose/model/transactionEvent';
/**
 * 取引アダプター
 *
 * todo ITransactionにIOwnerが結合しているために、デフォルトで.populate('owner')したりしている
 * Ownerをjoinするしないを必要に応じて使い分けられるようにする
 *
 * @export
 * @class TransactionAdapter
 */
export default class TransactionAdapter {
    readonly transactionModel: typeof TransactionModel;
    readonly transactionEventModel: typeof TransactionEventModel;
    private readonly connection;
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
