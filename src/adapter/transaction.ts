import { Connection } from 'mongoose';

import TransactionModel from './mongoose/model/transaction';
import TransactionEventModel from './mongoose/model/transactionEvent';

/**
 * 取引アダプター
 *
 * @class TransactionAdapter
 */
export default class TransactionAdapter {
    public readonly transactionModel: typeof TransactionModel;
    public readonly transactionEventModel: typeof TransactionEventModel;

    constructor(connection: Connection) {
        this.transactionModel = connection.model(TransactionModel.modelName);
        this.transactionEventModel = connection.model(TransactionEventModel.modelName);
    }
}
