"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gmoNotification_1 = require("./mongoose/model/gmoNotification");
/**
 * GMO通知レポジトリー
 *
 * @class GMONotificationRepository
 */
class GMONotificationRepository {
    constructor(connection) {
        this.gmoNotificationModel = connection.model(gmoNotification_1.default.modelName);
    }
}
exports.default = GMONotificationRepository;
