/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import TransactionModel from './mongoose/model/transaction';
/**
 * transaction adapter
 * @class
 */
export default class TransactionRepository {
    readonly transactionModel: typeof TransactionModel;
    constructor(connection: Connection);
    /**
     * find placeOrder transaction by id
     * @param {string} transactionId transaction id
     */
    findPlaceOrderById(transactionId: string): Promise<factory.transaction.placeOrder.ITransaction | null>;
}
