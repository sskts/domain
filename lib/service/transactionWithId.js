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
const GMO = require("@motionpicture/gmo-service");
const createDebug = require("debug");
const moment = require("moment");
const monapt = require("monapt");
const _ = require("underscore");
const util = require("util");
const argument_1 = require("../error/argument");
const AnonymousOwnerFactory = require("../factory/owner/anonymous");
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
 * @memberof service/transactionWithId
 * @deprecated use setAnonymousOwnerProfile instead
 */
function updateAnonymousOwner(args) {
    return (ownerAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const doc = yield transactionAdapter.transactionModel.findById(args.transaction_id).populate('owners').exec();
        if (doc === null) {
            throw new argument_1.default('transaction_id', `transaction[id:${args.transaction_id}] not found.`);
        }
        const transaction = doc.toObject();
        // 取引から、更新対象の所有者を取り出す
        const anonymousOwnerInTransaction = transaction.owners.find((ownerInTransaction) => {
            return (ownerInTransaction.group === ownerGroup_1.default.ANONYMOUS);
        });
        if (anonymousOwnerInTransaction === undefined) {
            throw new argument_1.default('transaction_id', 'anonymous owner not found');
        }
        const anonymousOwner = AnonymousOwnerFactory.create({
            id: anonymousOwnerInTransaction.id,
            name_first: args.name_first,
            name_last: args.name_last,
            email: args.email,
            tel: args.tel,
            state: anonymousOwnerInTransaction.state
        });
        return setOwnerProfile(args.transaction_id, anonymousOwner)(ownerAdapter, transactionAdapter);
    });
}
exports.updateAnonymousOwner = updateAnonymousOwner;
exports.updateAnonymousOwner = util.deprecate(updateAnonymousOwner, 'sskts-domain: service.transactionWithId.updateAnonymousOwner is deprecated, use service.transactionWithId.setOwnerProfile instead');
/**
 * 取引中の所有者プロフィールを変更する
 * 匿名所有者として開始した場合のみ想定(匿名か会員に変更可能)
 *
 * @export
 * @param {string} transactionId 取引ID
 * @param {(AnonymousOwnerFactory.IAnonymousOwner | MemberOwnerFactory.IMemberOwner)} owner 所有者
 * @returns {OwnerAndTransactionOperation<void>} 所有者と取引に対する操作
 */
function setOwnerProfile(transactionId, owner) {
    return (ownerAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const transaction = yield transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec()
            .then((doc) => {
            if (doc === null) {
                throw new argument_1.default('transactionId', `transaction[id:${transactionId}] not found.`);
            }
            return doc.toObject();
        });
        // 取引から、更新対象の所有者を取り出す
        const existingOwner = transaction.owners.find((ownerInTransaction) => ownerInTransaction.id === owner.id);
        if (existingOwner === undefined) {
            throw new argument_1.default('owner', `owner[id:${owner.id}] not found`);
        }
        if (owner.group === ownerGroup_1.default.MEMBER) {
            // 会員に更新の場合、まずGMO会員登録
            yield saveGMOMember(owner);
        }
        // 永続化
        // 上書きすることがポイント(匿名になったり会員になったりするので)
        debug('setting owner profile...');
        const result = yield ownerAdapter.model.update({ _id: owner.id }, owner, { overwrite: true }).exec();
        debug('owner updated', result);
        if (result.ok !== 1 || result.nModified !== 1) {
            console.error('fail in updating owner', result);
            throw new Error('fail in updating owner');
        }
    });
}
exports.setOwnerProfile = setOwnerProfile;
/**
 * 会員情報をGMO会員として保管する
 *
 * @param {MemberOwnerFactory.IMemberOwner} memberOwner 会員所有者
 */
function saveGMOMember(memberOwner) {
    return __awaiter(this, void 0, void 0, function* () {
        // GMO会員登録
        // GMOサイト情報は環境変数に持たせる(1システムにつき1サイト)
        // 2回目かもしれないので、存在チェック
        const searchMemberResult = yield GMO.services.card.searchMember({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: memberOwner.id
        });
        debug('GMO searchMember processed', searchMemberResult);
        if (searchMemberResult !== null) {
            // 存在していれば変更
            const updateMemberResult = yield GMO.services.card.updateMember({
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS,
                memberId: memberOwner.id,
                memberName: `${memberOwner.name_last} ${memberOwner.name_first}`
            });
            debug('GMO updateMember processed', updateMemberResult);
        }
        else {
            const saveMemberResult = yield GMO.services.card.saveMember({
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS,
                memberId: memberOwner.id,
                memberName: `${memberOwner.name_last} ${memberOwner.name_first}`
            });
            debug('GMO saveMember processed', saveMemberResult);
        }
    });
}
/**
 * 取引中の所有者に対してカード情報を保管する
 *
 * @export
 * @param {string} transactionId 取引ID
 * @param {string} ownerId 所有者ID
 * @param {(GMOCardFactory.IGMOCardRaw | GMOCardFactory.IGMOCardTokenized)} gmoCard GMOカード情報
 * @returns {TransactionOperation<void>} 取引に対する操作
 */
function saveCard(transactionId, ownerId, gmoCard) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const transaction = yield transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec()
            .then((doc) => {
            if (doc === null) {
                throw new argument_1.default('transactionId', `transaction[id:${transactionId}] not found.`);
            }
            return doc.toObject();
        });
        // 取引から、更新対象の所有者を取り出す
        const existingOwner = transaction.owners.find((ownerInTransaction) => ownerInTransaction.id === ownerId);
        if (existingOwner === undefined) {
            throw new argument_1.default('ownerId', `owner[id:${ownerId}] not found`);
        }
        // 万が一会員所有者でなければ不適切な操作
        if (existingOwner.group !== ownerGroup_1.default.MEMBER) {
            throw new argument_1.default('ownerId', `owner[id:${ownerId}] is not a member`);
        }
        // 登録済みのカードがあれば削除
        // もし会員未登録でこのサービスを使えば、この時点でGMOエラー
        const searchCardResults = yield GMO.services.card.searchCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: ownerId,
            seqMode: GMO.utils.util.SEQ_MODE_PHYSICS
        });
        debug('GMO searchCard processed', searchCardResults);
        yield Promise.all(searchCardResults.map((searchCardResult) => __awaiter(this, void 0, void 0, function* () {
            // 未削除であれば削除
            if (searchCardResult.deleteFlag !== '1') {
                const deleteCardResult = yield GMO.services.card.deleteCard({
                    siteId: process.env.GMO_SITE_ID,
                    sitePass: process.env.GMO_SITE_PASS,
                    memberId: ownerId,
                    seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
                    cardSeq: searchCardResult.cardSeq
                });
                debug('GMO deleteCard processed', deleteCardResult);
            }
        })));
        // GMOカード登録
        const saveCardResult = yield GMO.services.card.saveCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: ownerId,
            seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
            cardNo: gmoCard.card_no,
            cardPass: gmoCard.card_pass,
            expire: gmoCard.expire,
            holderName: gmoCard.holder_name,
            token: gmoCard.token
        });
        debug('GMO saveCard processed', saveCardResult);
    });
}
exports.saveCard = saveCard;
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
