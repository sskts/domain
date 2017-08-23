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
const createDebug = require("debug");
const transactionEventGroup_1 = require("../factory/transactionEventGroup");
const transaction_1 = require("./mongoose/model/transaction");
const transactionEvent_1 = require("./mongoose/model/transactionEvent");
const debug = createDebug('sskts-domain:adapter:transaction');
/**
 * 取引アダプター
 *
 * todo ITransactionにIOwnerが結合しているために、デフォルトで.populate('owner')したりしている
 * Ownerをjoinするしないを必要に応じて使い分けられるようにする
 *
 * @class TransactionAdapter
 */
class TransactionAdapter {
    constructor(connection) {
        this.transactionModel = connection.model(transaction_1.default.modelName);
        this.transactionEventModel = connection.model(transactionEvent_1.default.modelName);
    }
    addEvent(transactionEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            debug('creating transactionEvent...', transactionEvent);
            const update = Object.assign({}, transactionEvent);
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
                group: transactionEventGroup_1.default.ADD_NOTIFICATION
            }, 'notification')
                .setOptions({ maxTimeMS: 10000 })
                .exec())
                .map((doc) => doc.get('notification'));
            const removedNotificationIds = (yield this.transactionEventModel.find({
                transaction: id,
                group: transactionEventGroup_1.default.REMOVE_NOTIFICATION
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
                if (pricesByOwner[authorization.owner_from] === undefined) {
                    pricesByOwner[authorization.owner_from] = 0;
                }
                if (pricesByOwner[authorization.owner_to] === undefined) {
                    pricesByOwner[authorization.owner_to] = 0;
                }
                pricesByOwner[authorization.owner_from] -= authorization.price;
                pricesByOwner[authorization.owner_to] += authorization.price;
            });
            return Object.keys(pricesByOwner).every((ownerId) => (pricesByOwner[ownerId] === 0));
        });
    }
    /**
     * 取引IDから取引金額を算出する
     *
     * @returns {Promies<number>}
     */
    calculateAmountById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // 承認イベントリストから、特定の所有者からの承認のみを取り出して金額を算出する
            const authorizations = yield this.findAuthorizationsById(id);
            const ownerFromId = authorizations[0].owner_from;
            return authorizations.reduce((a, b) => {
                return a + ((b.owner_from === ownerFromId) ? b.price : 0);
            }, 0);
        });
    }
}
exports.default = TransactionAdapter;
