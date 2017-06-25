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
const bcrypt = require("bcryptjs");
const createDebug = require("debug");
const monapt = require("monapt");
const argument_1 = require("../error/argument");
const assetGroup_1 = require("../factory/assetGroup");
const ownerGroup_1 = require("../factory/ownerGroup");
const debug = createDebug('sskts-domain:service:member');
function login(username, password) {
    return (ownerAdapter) => __awaiter(this, void 0, void 0, function* () {
        // ユーザーネームで検索
        const memberOwnerDoc = yield ownerAdapter.model.findOne({
            username: username,
            group: ownerGroup_1.default.MEMBER
        }).exec();
        debug('member owner doc found', memberOwnerDoc);
        if (memberOwnerDoc === null) {
            return monapt.None;
        }
        // パスワード整合性確認
        debug('comparing passwords...');
        if (!(yield bcrypt.compare(password, memberOwnerDoc.get('password_hash')))) {
            return monapt.None;
        }
        const memberOwner = memberOwnerDoc.toObject();
        // ハッシュ化パスワードは返さない
        delete memberOwner.password_hash;
        return monapt.Option(memberOwner);
    });
}
exports.login = login;
function updateProfile(ownerId, update) {
    return (ownerAdapter) => __awaiter(this, void 0, void 0, function* () {
        const memberOwnerDoc = yield ownerAdapter.model.findByIdAndUpdate(ownerId, update).exec();
        if (memberOwnerDoc === null) {
            throw new argument_1.default('ownerId', `owner[id:${ownerId}] not found`);
        }
    });
}
exports.updateProfile = updateProfile;
function addCard(ownerId, card) {
    return (ownerAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 会員存在確認
        const memberOwnerDoc = yield ownerAdapter.model.findById(ownerId, '_id').exec();
        debug('member owner doc found', memberOwnerDoc);
        // GMOカード登録
        debug('saving a card to GMO...', card);
    });
}
exports.addCard = addCard;
function removeCard(ownerId, cardSeq) {
    return (ownerAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 会員存在確認
        const memberOwnerDoc = yield ownerAdapter.model.findById(ownerId, '_id').exec();
        debug('member owner doc found', memberOwnerDoc);
        // GMOカード登録
        debug('removing a card from GMO...cardSeq:', cardSeq);
    });
}
exports.removeCard = removeCard;
function findSeatReservationAssets(ownerId) {
    return (assetAdapter, ownerAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 会員存在確認
        const memberOwnerDoc = yield ownerAdapter.model.findById(ownerId, '_id').exec();
        debug('member owner doc found', memberOwnerDoc);
        // 資産検索
        const assets = yield assetAdapter.model.find({
            group: assetGroup_1.default.SEAT_RESERVATION,
            owner: ownerId
        }).lean().exec();
        return assets;
    });
}
exports.findSeatReservationAssets = findSeatReservationAssets;
