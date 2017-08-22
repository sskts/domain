/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import GMONotificationModel from './mongoose/model/gmoNotification';
/**
 * GMO通知アダプター
 *
 * @class GMONotificationAdapter
 */
export default class GMONotificationAdapter {
    readonly gmoNotificationModel: typeof GMONotificationModel;
    constructor(connection: Connection);
}
