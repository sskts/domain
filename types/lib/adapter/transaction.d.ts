/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import * as AuthorizationFactory from '../factory/authorization';
import * as NotificationFactory from '../factory/notification';
import * as TransactionEventFactory from '../factory/transactionEvent';
import TransactionModel from './mongoose/model/transaction';
import TransactionEventModel from './mongoose/model/transactionEvent';
/**
 * 取引アダプター
 *
 * todo ITransactionにIOwnerが結合しているために、デフォルトで.populate('owner')したりしている
 * Ownerをjoinするしないを必要に応じて使い分けられるようにする
 *
 * @class TransactionAdapter
 */
export default class TransactionAdapter {
    readonly transactionModel: typeof TransactionModel;
    readonly transactionEventModel: typeof TransactionEventModel;
    constructor(connection: Connection);
    addEvent(transactionEvent: TransactionEventFactory.ITransactionEvent): Promise<void>;
    findAuthorizationsById(id: string): Promise<AuthorizationFactory.IAuthorization[]>;
    findNotificationsById(id: string): Promise<NotificationFactory.INotification[]>;
    /**
     * 成立可能かどうか
     *
     * @returns {Promies<boolean>}
     */
    canBeClosed(id: string): Promise<boolean>;
}
