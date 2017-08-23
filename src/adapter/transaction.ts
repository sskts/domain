import { Connection } from 'mongoose';

import TransactionModel from './mongoose/model/transaction';

/**
 * 取引アダプター
 *
 * @class TransactionAdapter
 */
export default class TransactionAdapter {
    public readonly transactionModel: typeof TransactionModel;

    constructor(connection: Connection) {
        this.transactionModel = connection.model(TransactionModel.modelName);
    }
}
