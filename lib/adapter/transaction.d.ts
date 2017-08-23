/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import TransactionModel from './mongoose/model/transaction';
/**
 * 取引アダプター
 *
 * @class TransactionAdapter
 */
export default class TransactionAdapter {
    readonly transactionModel: typeof TransactionModel;
    constructor(connection: Connection);
}
