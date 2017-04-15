import { Connection } from 'mongoose';
import GMONotificationModel from './mongoose/model/gmoNotification';

/**
 * GMO通知アダプター
 *
 * @export
 * @class GMONotificationAdapter
 */
export default class GMONotificationAdapter {
    public readonly gmoNotificationModel: typeof GMONotificationModel;

    constructor(connection: Connection) {
        this.gmoNotificationModel = connection.model(GMONotificationModel.modelName);
    }
}
