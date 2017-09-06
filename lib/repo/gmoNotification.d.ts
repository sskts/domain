/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import GMONotificationModel from './mongoose/model/gmoNotification';
/**
 * GMO通知レポジトリー
 *
 * @class GMONotificationRepository
 */
export declare class MongoRepository {
    readonly gmoNotificationModel: typeof GMONotificationModel;
    constructor(connection: Connection);
}
