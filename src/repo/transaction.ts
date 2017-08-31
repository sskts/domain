import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';

import TransactionModel from './mongoose/model/transaction';

/**
 * transaction adapter
 * @class
 */
export default class TransactionRepository {
    public readonly transactionModel: typeof TransactionModel;

    constructor(connection: Connection) {
        this.transactionModel = connection.model(TransactionModel.modelName);
    }

    /**
     * find placeOrder transaction by id
     * @param {string} transactionId transaction id
     */
    public async findPlaceOrderById(transactionId: string): Promise<factory.transaction.placeOrder.ITransaction | null> {
        return await this.transactionModel.findOne({
            _id: transactionId,
            typeOf: factory.transactionType.PlaceOrder
        }).exec()
            .then((doc) => {
                return (doc === null) ? null : <factory.transaction.placeOrder.ITransaction>doc.toObject();
            });

    }
}
