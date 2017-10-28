import * as GMO from '@motionpicture/gmo-service';
import { Connection } from 'mongoose';
import GMONotificationModel from './mongoose/model/gmoNotification';

/**
 * GMO通知レポジトリー
 * @class GMONotificationRepository
 */
export class MongoRepository {
    public readonly gmoNotificationModel: typeof GMONotificationModel;

    constructor(connection: Connection) {
        this.gmoNotificationModel = connection.model(GMONotificationModel.modelName);
    }

    /**
     * 通知を保管する
     * @param notification GMO結果通知オブジェクト
     */
    public async save(notification: GMO.factory.resultNotification.creditCard.IResultNotification) {
        await this.gmoNotificationModel.create(notification);
    }
}
