"use strict";
/**
 * 取引(ID指定)サービス
 *
 * @namespace service/transactionWithId
 */
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
const moment = require("moment");
const monapt = require("monapt");
const _ = require("underscore");
const argument_1 = require("../error/argument");
const ownerGroup_1 = require("../factory/ownerGroup");
const AddNotificationTransactionEventFactory = require("../factory/transactionEvent/addNotification");
const AuthorizeTransactionEventFactory = require("../factory/transactionEvent/authorize");
const RemoveNotificationTransactionEventFactory = require("../factory/transactionEvent/removeNotification");
const UnauthorizeTransactionEventFactory = require("../factory/transactionEvent/unauthorize");
const transactionStatus_1 = require("../factory/transactionStatus");
const debug = createDebug('sskts-domain:service:transaction');
/**
 * IDから取得する
 *
 * @param {string} id
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberof service/transactionWithId
 */
function findById(id) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const doc = yield transactionAdapter.transactionModel.findById(id).populate('owners').exec();
        return (doc === null) ? monapt.None : monapt.Option(doc.toObject());
    });
}
exports.findById = findById;
function addAuthorization(transactionId, authorization) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const doc = yield transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (doc === null) {
            throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
        }
        const transaction = doc.toObject();
        // 所有者が取引に存在するかチェック
        const ownerIds = transaction.owners.map((owner) => {
            return owner.id;
        });
        if (ownerIds.indexOf(authorization.owner_from) < 0) {
            throw new argument_1.default('authorization.owner_from', `transaction[${transactionId}] does not contain a owner[${authorization.owner_from}].`);
        }
        if (ownerIds.indexOf(authorization.owner_to) < 0) {
            throw new argument_1.default('authorization.owner_to', `transaction[${transactionId}] does not contain a owner[${authorization.owner_to}].`);
        }
        // イベント作成
        const event = AuthorizeTransactionEventFactory.create({
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: authorization
        });
        // 永続化
        debug('adding an event...', event);
        yield transactionAdapter.addEvent(event);
    });
}
exports.addAuthorization = addAuthorization;
/**
 * GMO資産承認
 *
 * @param {string} transactionId
 * @param {GMOAuthorization} authorization
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
function addGMOAuthorization(transactionId, authorization) {
    return addAuthorization(transactionId, authorization);
}
exports.addGMOAuthorization = addGMOAuthorization;
/**
 * COA資産承認
 *
 * @param {string} transactionId
 * @param {COASeatReservationAuthorization} authorization
 * @returns {OwnerAndTransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
function addCOASeatReservationAuthorization(transactionId, authorization) {
    return addAuthorization(transactionId, authorization);
}
exports.addCOASeatReservationAuthorization = addCOASeatReservationAuthorization;
/**
 * ムビチケ着券承認追加
 *
 * @param {string} transactionId
 * @param {MvtkAuthorization.IMvtkAuthorization} authorization
 * @returns {OwnerAndTransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
function addMvtkAuthorization(transactionId, authorization) {
    return addAuthorization(transactionId, authorization);
}
exports.addMvtkAuthorization = addMvtkAuthorization;
/**
 * 資産承認解除
 *
 * @param {string} transactionId
 * @param {string} authorizationId
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
function removeAuthorization(transactionId, authorizationId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const doc = yield transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (doc === null) {
            throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
        }
        const authorizations = yield transactionAdapter.findAuthorizationsById(doc.get('id'));
        const removedAuthorization = authorizations.find((authorization) => authorization.id === authorizationId);
        if (removedAuthorization === undefined) {
            throw new argument_1.default('authorizationId', `authorization [${authorizationId}] not found in the transaction.`);
        }
        // イベント作成
        const event = UnauthorizeTransactionEventFactory.create({
            transaction: doc.get('id'),
            occurred_at: new Date(),
            authorization: removedAuthorization
        });
        // 永続化
        debug('adding an event...', event);
        yield transactionAdapter.addEvent(event);
    });
}
exports.removeAuthorization = removeAuthorization;
/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
function addEmail(transactionId, notification) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // イベント作成
        const event = AddNotificationTransactionEventFactory.create({
            transaction: transactionId,
            occurred_at: new Date(),
            notification: notification
        });
        // 永続化
        debug('adding an event...', event);
        yield transactionAdapter.addEvent(event);
    });
}
exports.addEmail = addEmail;
/**
 * メール削除
 *
 * @param {string} transactionId
 * @param {string} notificationId
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
function removeEmail(transactionId, notificationId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const doc = yield transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (doc === null) {
            throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
        }
        const notifications = yield transactionAdapter.findNotificationsById(doc.get('id'));
        const removedNotification = notifications.find((notification) => notification.id === notificationId);
        if (removedNotification === undefined) {
            throw new argument_1.default('notificationId', `notification [${notificationId}] not found in the transaction.`);
        }
        // イベント作成
        const event = RemoveNotificationTransactionEventFactory.create({
            transaction: doc.get('id'),
            occurred_at: new Date(),
            notification: removedNotification
        });
        // 永続化
        yield transactionAdapter.addEvent(event);
    });
}
exports.removeEmail = removeEmail;
/**
 * 匿名所有者更新
 *
 * @returns {OwnerAndTransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
function updateAnonymousOwner(args) {
    return (ownerAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const doc = yield transactionAdapter.transactionModel.findById(args.transaction_id).populate('owners').exec();
        if (doc === null) {
            throw new argument_1.default('args.transaction_id', `transaction[${args.transaction_id}] not found.`);
        }
        const transaction = doc.toObject();
        const anonymousOwner = transaction.owners.find((owner) => {
            return (owner.group === ownerGroup_1.default.ANONYMOUS);
        });
        if (anonymousOwner === undefined) {
            throw new argument_1.default('args.transaction_id', 'anonymous owner not found');
        }
        // 永続化
        debug('updating anonymous owner...');
        const ownerDoc = yield ownerAdapter.model.findByIdAndUpdate(anonymousOwner.id, {
            name_first: args.name_first,
            name_last: args.name_last,
            email: args.email,
            tel: args.tel
        }).exec();
        if (ownerDoc === null) {
            throw new argument_1.default('args.transaction_id', 'owner not found');
        }
    });
}
exports.updateAnonymousOwner = updateAnonymousOwner;
/**
 * 照合を可能にする
 *
 * @param {string} transactionId
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberof service/transactionWithId
 */
function enableInquiry(id, key) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 進行中の取引に照会キー情報を追加
        debug('updating transaction...');
        const doc = yield transactionAdapter.transactionModel.findOneAndUpdate({
            _id: id,
            status: transactionStatus_1.default.UNDERWAY
        }, {
            inquiry_key: key
        }, { new: true }).exec();
        if (doc === null) {
            throw new Error('UNDERWAY transaction not found');
        }
    });
}
exports.enableInquiry = enableInquiry;
/**
 * 取引成立
 *
 * @param {string} transactionId
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
function close(id) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const doc = yield transactionAdapter.transactionModel.findById(id).exec();
        if (doc === null) {
            throw new argument_1.default('id', `transaction[${id}] not found.`);
        }
        // 照会可能になっているかどうか
        if (_.isEmpty(doc.get('inquiry_key'))) {
            throw new Error('inquiry is not available');
        }
        // 条件が対等かどうかチェック
        if (!(yield transactionAdapter.canBeClosed(doc.get('id')))) {
            throw new Error('transaction cannot be closed');
        }
        // ステータス変更
        debug('updating transaction...');
        const closedTransactionDoc = yield transactionAdapter.transactionModel.findOneAndUpdate({
            _id: doc.get('id'),
            status: transactionStatus_1.default.UNDERWAY
        }, {
            status: transactionStatus_1.default.CLOSED,
            closed_at: moment().toDate()
        }, { new: true }).exec();
        if (closedTransactionDoc === null) {
            throw new Error('UNDERWAY transaction not found');
        }
    });
}
exports.close = close;
