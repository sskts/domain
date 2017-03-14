"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * キューリポジトリ
 *
 * @class QueueAdapter
 */
const monapt = require("monapt");
const authorizationGroup_1 = require("../factory/authorizationGroup");
const notificationGroup_1 = require("../factory/notificationGroup");
const queueGroup_1 = require("../factory/queueGroup");
const queue_1 = require("./mongoose/model/queue");
class QueueAdapter {
    constructor(connection) {
        this.connection = connection;
        this.model = this.connection.model(queue_1.default.modelName);
    }
    findOneSendEmailAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            })
                .where({
                group: queueGroup_1.default.PUSH_NOTIFICATION,
                'notification.group': notificationGroup_1.default.EMAIL
            }).exec();
            return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
        });
    }
    findOneSettleGMOAuthorizationAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            })
                .where({
                group: queueGroup_1.default.SETTLE_AUTHORIZATION,
                'authorization.group': authorizationGroup_1.default.GMO
            })
                .exec();
            return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
        });
    }
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            })
                .where({
                group: queueGroup_1.default.SETTLE_AUTHORIZATION,
                'authorization.group': authorizationGroup_1.default.COA_SEAT_RESERVATION
            })
                .exec();
            return (doc)
                ? monapt.Option(doc.toObject())
                : monapt.None;
        });
    }
    findOneCancelGMOAuthorizationAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            })
                .where({
                group: queueGroup_1.default.CANCEL_AUTHORIZATION,
                'authorization.group': authorizationGroup_1.default.GMO
            })
                .exec();
            return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
        });
    }
    findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            })
                .where({
                group: queueGroup_1.default.CANCEL_AUTHORIZATION,
                'authorization.group': authorizationGroup_1.default.COA_SEAT_RESERVATION
            })
                .exec();
            return (doc)
                ? monapt.Option(doc.toObject())
                : monapt.None;
        });
    }
    findOneDisableTransactionInquiryAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            })
                .where({
                group: queueGroup_1.default.DISABLE_TRANSACTION_INQUIRY
            })
                .exec();
            return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
        });
    }
}
exports.default = QueueAdapter;
