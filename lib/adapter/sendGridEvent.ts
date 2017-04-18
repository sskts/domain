import { Connection } from 'mongoose';
import SendGridEventModel from './mongoose/model/sendGridEvent';

/**
 * SendGridイベントアダプター
 *
 * @class SendGridEventAdapter
 */
export default class SendGridEventAdapter {
    public readonly sendGridEventModel: typeof SendGridEventModel;

    constructor(connection: Connection) {
        this.sendGridEventModel = connection.model(SendGridEventModel.modelName);
    }
}
