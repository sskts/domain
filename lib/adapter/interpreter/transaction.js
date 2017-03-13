/**
 * 取引リポジトリ
 *
 * todo ITransactionにIOwnerが結合しているために、デフォルトで.populate('owner')したりしている
 * Ownerをjoinするしないを必要に応じて使い分けられるようにする
 *
 * @class TransactionAdapterInterpreter
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
const clone = require("clone");
const createDebug = require("debug");
const monapt = require("monapt");
const mongoose_1 = require("mongoose");
const transactionEventGroup_1 = require("../../factory/transactionEventGroup");
const transaction_1 = require("./mongoose/model/transaction");
const transactionEvent_1 = require("./mongoose/model/transactionEvent");
const debug = createDebug('sskts-domain:adapter:transaction');
class TransactionAdapterInterpreter {
    constructor(connection) {
        this.connection = connection;
        this.transactionModel = this.connection.model(transaction_1.default.modelName);
        this.transactionEventModel = this.connection.model(transactionEvent_1.default.modelName);
    }
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield this.transactionModel.find()
                .setOptions({ maxTimeMS: 10000 })
                .where(conditions)
                .populate('owner')
                .exec();
            return docs.map((doc) => doc.toObject());
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.transactionModel.findById(id).populate('owners').exec();
            return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
        });
    }
    findOne(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.transactionModel.findOne(conditions).populate('owners').exec();
            return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.transactionModel.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).exec();
            return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
        });
    }
    store(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            debug('findByIdAndUpdate...', transaction);
            const update = clone(transaction, false);
            update.owners = update.owners.map((owner) => owner.id);
            yield this.transactionModel.findByIdAndUpdate(update.id, update, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
    create(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            const updates = transactions.map((transaction) => {
                const update = clone(transaction);
                update._id = mongoose_1.Types.ObjectId(update.id);
                update.owners = update.owners.map((owner) => owner.id);
                return update;
            });
            yield this.transactionModel.create(updates);
        });
    }
    addEvent(transactionEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = clone(transactionEvent, false);
            yield this.transactionEventModel.create([update]);
        });
    }
    findAuthorizationsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const authorizations = (yield this.transactionEventModel.find({
                transaction: id,
                group: transactionEventGroup_1.default.AUTHORIZE
            }, 'authorization')
                .setOptions({ maxTimeMS: 10000 })
                .exec())
                .map((doc) => doc.get('authorization'));
            const removedAuthorizationIds = (yield this.transactionEventModel.find({
                transaction: id,
                group: transactionEventGroup_1.default.UNAUTHORIZE
            }, 'authorization.id')
                .setOptions({ maxTimeMS: 10000 })
                .exec())
                .map((doc) => doc.get('authorization.id'));
            return authorizations.filter((authorization) => removedAuthorizationIds.indexOf(authorization.id) < 0);
        });
    }
    findNotificationsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const notifications = (yield this.transactionEventModel.find({
                transaction: id,
                group: transactionEventGroup_1.default.NOTIFICATION_ADD
            }, 'notification')
                .setOptions({ maxTimeMS: 10000 })
                .exec())
                .map((doc) => doc.get('notification'));
            const removedNotificationIds = (yield this.transactionEventModel.find({
                transaction: id,
                group: transactionEventGroup_1.default.NOTIFICATION_REMOVE
            }, 'notification.id')
                .setOptions({ maxTimeMS: 10000 })
                .exec())
                .map((doc) => doc.get('notification.id'));
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
    remove(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.transactionModel.remove(conditions).exec();
        });
    }
}
exports.default = TransactionAdapterInterpreter;
