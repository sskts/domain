/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import TransactionModel from './mongoose/model/transaction';
import TransactionEventModel from './mongoose/model/transactionEvent';
/**
 * 取引アダプター
 *
 * @class TransactionAdapter
 */
export default class TransactionAdapter {
    readonly transactionModel: typeof TransactionModel;
    readonly transactionEventModel: typeof TransactionEventModel;
    constructor(connection: Connection);
}
