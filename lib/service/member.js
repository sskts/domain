"use strict";
/**
 * 会員サービス
 *
 * @namespace service/member
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
const bcrypt = require("bcryptjs");
const createDebug = require("debug");
const monapt = require("monapt");
const argument_1 = require("../error/argument");
const assetGroup_1 = require("../factory/assetGroup");
const GMOCardFactory = require("../factory/card/gmo");
const MemberOwnerFactory = require("../factory/owner/member");
const ownerGroup_1 = require("../factory/ownerGroup");
const debug = createDebug('sskts-domain:service:member');
/**
 * ログイン
 *
 * @export
 * @param {string} username ユーザーネーム
 * @param {string} password パスワード
 * @returns {IOwnerOperation<monapt.Option<MemberOwnerFactory.IUnhashedFields>>} 所有者に対する操作
 * @memberof service/member
 */
function login(username, password) {
    return (ownerAdapter) => __awaiter(this, void 0, void 0, function* () {
        // ユーザーネームで検索
        const memberOwnerDoc = yield ownerAdapter.model.findOne({
            username: username,
            group: ownerGroup_1.default.MEMBER
        }, 'username password_hash').exec();
        debug('member owner doc found', memberOwnerDoc);
        if (memberOwnerDoc === null) {
            return monapt.None;
        }
        // パスワード整合性確認
        debug('comparing passwords...');
        if (!(yield bcrypt.compare(password, memberOwnerDoc.get('password_hash')))) {
            return monapt.None;
        }
        // ハッシュ化パスワードは返さない
        return monapt.Option({
            id: memberOwnerDoc.get('id'),
            username: memberOwnerDoc.get('username')
        });
    });
}
exports.login = login;
/**
 * プロフィール更新
 * 更新フィールドを全て上書きするので注意
 *
 * @export
 * @param {string} ownerId 所有者ID
 * @param {MemberOwnerFactory.IVariableFields} update 更新フィールド
 * @returns {IOwnerOperation<void>} 所有者に対する操作
 * @memberof service/member
 */
function updateProfile(ownerId, update) {
    return (ownerAdapter) => __awaiter(this, void 0, void 0, function* () {
        // バリデーション
        MemberOwnerFactory.validateVariableFields(update);
        const memberOwnerDoc = yield ownerAdapter.model.findByIdAndUpdate(ownerId, {
            name_first: update.name_first,
            name_last: update.name_last,
            email: update.email,
            tel: update.tel,
            description: update.description,
            notes: update.notes
        }).exec();
        if (memberOwnerDoc === null) {
            throw new argument_1.default('ownerId', `owner[id:${ownerId}] not found`);
        }
    });
}
exports.updateProfile = updateProfile;
/**
 * カードを追加する
 *
 * @export
 * @param {string} ownerId 所有者ID
 * @param {(GMOCardFactory.IGMOCardRaw | GMOCardFactory.IGMOCardTokenized)} card GMOカードオブジェクト
 * @returns {IOperation<string>} 操作
 * @memberof service/member
 */
function addCard(ownerId, card) {
    return () => __awaiter(this, void 0, void 0, function* () {
        // GMOカード登録
        debug('saving a card to GMO...', card);
        const saveCardResult = yield GMO.services.card.saveCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: ownerId,
            seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
            cardNo: card.card_no,
            cardPass: card.card_pass,
            expire: card.expire,
            holderName: card.holder_name,
            token: card.token
        });
        debug('card saved', saveCardResult);
        return saveCardResult.cardSeq;
    });
}
exports.addCard = addCard;
/**
 * カード削除
 *
 * @export
 * @param {string} ownerId 所有者ID
 * @param {string} cardSeq GMO側のカード登録連番
 * @returns {IOperation<void>} 操作
 * @memberof service/member
 */
function removeCard(ownerId, cardSeq) {
    return () => __awaiter(this, void 0, void 0, function* () {
        // GMOカード削除
        debug('removing a card from GMO...cardSeq:', cardSeq);
        const deleteCardResult = yield GMO.services.card.deleteCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: ownerId,
            seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
            cardSeq: cardSeq
        });
        debug('card deleted', deleteCardResult);
    });
}
exports.removeCard = removeCard;
/**
 * 会員カード検索
 *
 * @export
 * @param {string} ownerId 所有者ID
 * @returns {IOperation<GMOCardFactory.ICheckedCard[]>} カードリストを取得する操作
 * @memberof service/member
 */
function findCards(ownerId) {
    return () => __awaiter(this, void 0, void 0, function* () {
        // GMOカード検索
        return yield GMO.services.card.searchCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: ownerId,
            seqMode: GMO.utils.util.SEQ_MODE_PHYSICS
        }).then((searchCardResults) => {
            return searchCardResults
                .filter((searchCardResult) => searchCardResult.deleteFlag === '0')
                .map(GMOCardFactory.createCheckedCardFromGMOSearchCardResult);
        });
    });
}
exports.findCards = findCards;
/**
 * 会員の座席予約資産を検索する
 *
 * @export
 * @param {string} ownerId 所有者ID
 * @returns {IAssetOperation<SeatReservationAssetFactory.ISeatReservationAsset[]>} 資産に対する操作
 * @memberof service/member
 */
function findSeatReservationAssets(ownerId) {
    return (assetAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 資産全検索
        // todo add limit
        return yield assetAdapter.model.find({
            group: assetGroup_1.default.SEAT_RESERVATION,
            'ownership.owner': ownerId
        }).sort({ created_at: 1 })
            .exec()
            .then((docs) => docs.map((doc) => doc.toObject()));
    });
}
exports.findSeatReservationAssets = findSeatReservationAssets;
