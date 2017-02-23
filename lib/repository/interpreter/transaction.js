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
const createDebug = require("debug");
const monapt = require("monapt");
const transaction_1 = require("../../model/transaction");
const transactionEventGroup_1 = require("../../model/transactionEventGroup");
const transaction_2 = require("./mongoose/model/transaction");
const transactionEvent_1 = require("./mongoose/model/transactionEvent");
const debug = createDebug('sskts-domain:repository:transaction');
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
                .exec();
            return docs.map((doc) => transaction_1.default.create(doc.toObject()));
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName);
            const doc = yield model.findById(id)
                .populate('owners').exec();
            return (doc) ? monapt.Option(transaction_1.default.create(doc.toObject())) : monapt.None;
        });
    }
    findOne(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName);
            const doc = yield model.findOne(conditions).exec();
            return (doc) ? monapt.Option(transaction_1.default.create(doc.toObject())) : monapt.None;
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName);
            const doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).exec();
            return (doc) ? monapt.Option(transaction_1.default.create(doc.toObject())) : monapt.None;
        });
    }
    store(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName);
            debug('updating a transaction...', transaction);
            yield model.findByIdAndUpdate(transaction.id, transaction.toDocument(), {
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
                .exec())
                .map((doc) => doc.get('authorization'));
            const removedAuthorizationIds = (yield model.find({
                transaction: id,
                group: transactionEventGroup_1.default.UNAUTHORIZE
            }, 'authorization._id')
                .exec())
                .map((doc) => doc.get('id'));
            return authorizations.filter((authorization) => removedAuthorizationIds.indexOf(authorization.id) < 0);
        });
    }
    findNotificationsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transactionEvent_1.default.modelName);
            const notifications = (yield model.find({
                transaction: id,
                group: transactionEventGroup_1.default.NOTIFICATION_ADD
            }, 'notification')
                .exec())
                .map((doc) => doc.get('notification'));
            const removedNotificationIds = (yield model.find({
                transaction: id,
                group: transactionEventGroup_1.default.NOTIFICATION_REMOVE
            }, 'notification._id')
                .exec())
                .map((doc) => doc.get('id'));
            return notifications.filter((notification) => (removedNotificationIds.indexOf(notification.id) < 0));
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
                if (!pricesByOwner[authorization.owner_from]) {
                    pricesByOwner[authorization.owner_from] = 0;
                }
                if (!pricesByOwner[authorization.owner_to]) {
                    pricesByOwner[authorization.owner_to] = 0;
                }
                pricesByOwner[authorization.owner_from] -= authorization.price;
                pricesByOwner[authorization.owner_to] += authorization.price;
            });
            return Object.keys(pricesByOwner).every((ownerId) => (pricesByOwner[ownerId] === 0));
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionRepositoryInterpreter;
