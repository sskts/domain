import { Connection } from 'mongoose';

import ActionModel from './mongoose/model/action';

/**
 * アクションアダプター
 *
 * @class ActionAdapter
 */
export default class ActionAdapter {
    public readonly actionModel: typeof ActionModel;

    constructor(connection: Connection) {
        this.actionModel = connection.model(ActionModel.modelName);
    }

    // public async pushEvent(id: string, transactionEvent: TransactionEventFactory.ITransactionEvent) {
    //     debug('creating transactionEvent...', transactionEvent);
    //     await this.transactionModel.findByIdAndUpdate(
    //         id,
    //         { $push: { transactionEvents: transactionEvent } }
    //     ).exec();
    // }
}
