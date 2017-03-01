/**
 * キューリポジトリ
 *
 * @class QueueRepositoryInterpreter
 */
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
const monapt = require("monapt");
const authorizationGroup_1 = require("../../model/authorizationGroup");
const notificationGroup_1 = require("../../model/notificationGroup");
const queue_1 = require("../../model/queue");
const queueGroup_1 = require("../../model/queueGroup");
const transaction_1 = require("../../model/transaction");
const queue_2 = require("./mongoose/model/queue");
class QueueRepositoryInterpreter {
    constructor(connection) {
        this.connection = connection;
        this.model = this.connection.model(queue_2.default.modelName);
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).exec();
            return (doc) ? monapt.Option(queue_1.default.create(doc.toObject())) : monapt.None;
        });
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
            return (doc) ? monapt.Option(queue_1.default.createPushNotification(doc.toObject())) : monapt.None;
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
            return (doc) ? monapt.Option(queue_1.default.createSettleAuthorization(doc.toObject())) : monapt.None;
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
            const queue = queue_1.default.createSettleAuthorization(doc.toObject());
            return (doc) ? monapt.Option(queue) : monapt.None;
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
            return (doc) ? monapt.Option(queue_1.default.createCancelAuthorization(doc.toObject())) : monapt.None;
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
            const queue = queue_1.default.createCancelAuthorization(doc.toObject());
            return (doc) ? monapt.Option(queue) : monapt.None;
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
            if (doc) {
                const object = doc.toObject();
                object.transaction = transaction_1.default.create(doc.get('transaction'));
                return monapt.Option(queue_1.default.createDisableTransactionInquiry(object));
            }
            else {
                return monapt.None;
            }
        });
    }
    store(queue) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.findByIdAndUpdate(queue.id, queue, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
exports.default = QueueRepositoryInterpreter;
