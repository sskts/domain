/**
 * 取引リポジトリ
 *
 * @class TransactionRepositoryInterpreter
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
const monapt = require("monapt");
const transaction_1 = require("../../model/transaction");
const transactionEventGroup_1 = require("../../model/transactionEventGroup");
const transaction_2 = require("./mongoose/model/transaction");
const transactionEvent_1 = require("./mongoose/model/transactionEvent");
class TransactionRepositoryInterpreter {
    constructor(connection) {
        this.connection = connection;
    }
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName);
            const docs = yield model.find()
                .where(conditions)
                .populate('owner')
                .lean()
                .exec();
            return docs.map(transaction_1.default.create);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName);
            const doc = yield model.findOne()
                .where('_id').equals(id)
                .populate('owners').lean().exec();
            return (doc) ? monapt.Option(transaction_1.default.create(doc)) : monapt.None;
        });
    }
    findOne(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName);
            const doc = yield model.findOne(conditions).lean().exec();
            return (doc) ? monapt.Option(transaction_1.default.create(doc)) : monapt.None;
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName);
            const doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).lean().exec();
            return (doc) ? monapt.Option(transaction_1.default.create(doc)) : monapt.None;
        });
    }
    store(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName);
            yield model.findOneAndUpdate({ _id: transaction._id }, transaction, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
    addEvent(transactionEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transactionEvent_1.default.modelName);
            yield model.create([transactionEvent]);
        });
    }
    findAuthorizationsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transactionEvent_1.default.modelName);
            const authorizations = (yield model.find({
                transaction: id,
                group: transactionEventGroup_1.default.AUTHORIZE
            }, 'authorization')
                .lean().exec())
                .map((doc) => doc.authorization);
            const removedAuthorizationIds = (yield model.find({
                transaction: id,
                group: transactionEventGroup_1.default.UNAUTHORIZE
            }, 'authorization._id')
                .lean().exec())
                .map((doc) => doc.authorization._id.toString());
            return authorizations.filter((authorization) => (removedAuthorizationIds.indexOf(authorization._id.toString()) < 0));
        });
    }
    findNotificationsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transactionEvent_1.default.modelName);
            const notifications = (yield model.find({
                transaction: id,
                group: transactionEventGroup_1.default.NOTIFICATION_ADD
            }, 'notification')
                .lean().exec())
                .map((doc) => doc.notification);
            const removedNotificationIds = (yield model.find({
                transaction: id,
                group: transactionEventGroup_1.default.NOTIFICATION_REMOVE
            }, 'notification._id')
                .lean().exec())
                .map((doc) => doc.notification._id.toString());
            return notifications.filter((notification) => (removedNotificationIds.indexOf(notification._id.toString()) < 0));
        });
    }
    /**
     * 成立可能かどうか
     *
     * @returns {Promies<boolean>}
     */
    canBeClosed(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const authorizations = yield this.findAuthorizationsById(id);
            const pricesByOwner = {};
            authorizations.forEach((authorization) => {
                if (!pricesByOwner[authorization.owner_from.toString()]) {
                    pricesByOwner[authorization.owner_from.toString()] = 0;
                }
                if (!pricesByOwner[authorization.owner_to.toString()]) {
                    pricesByOwner[authorization.owner_to.toString()] = 0;
                }
                pricesByOwner[authorization.owner_from.toString()] -= authorization.price;
                pricesByOwner[authorization.owner_to.toString()] += authorization.price;
            });
            return Object.keys(pricesByOwner).every((ownerId) => (pricesByOwner[ownerId] === 0));
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionRepositoryInterpreter;
