import { Connection } from 'mongoose';
import GMONotificationModel from './mongoose/model/gmoNotification';

/**
 * GMO通知レポジトリー
 *
 * @class GMONotificationRepository
 */
export default class GMONotificationRepository {
    public readonly gmoNotificationModel: typeof GMONotificationModel;

    constructor(connection: Connection) {
        this.gmoNotificationModel = connection.model(GMONotificationModel.modelName);
    }
}
