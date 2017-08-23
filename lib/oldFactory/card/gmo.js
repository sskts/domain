"use strict";
/**
 * GMOカードファクトリー
 *
 * @namespace factory/card/gmo
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cardGroup_1 = require("../cardGroup");
const GMOCardIDFactory = require("../cardId/gmo");
/**
 * GMOカード検索結果から有効性確認済みカードを作成する
 *
 * @export
 * @param {GMO.services.card.ISearchCardResult} searchCardResult GMOカード検索結果
 * @param {string} ownerId 所有者ID
 * @returns {ICheckedCard} 有効性確認済みカード
 * @memberof factory/card/gmo
 */
function createCheckedCardFromGMOSearchCardResult(searchCardResult, ownerId) {
    return {
        id: GMOCardIDFactory.create(cardGroup_1.default.GMO, searchCardResult.cardSeq),
        owner: ownerId,
        group: cardGroup_1.default.GMO,
        card_seq: searchCardResult.cardSeq,
        card_name: searchCardResult.cardName,
        card_no: searchCardResult.cardNo,
        expire: searchCardResult.expire,
        holder_name: searchCardResult.holderName
    };
}
exports.createCheckedCardFromGMOSearchCardResult = createCheckedCardFromGMOSearchCardResult;
/**
 * 生の有効性確認前GMOカードを作成する
 *
 * @export
 * @param {string} args.card_no カード番号
 * @param {string} args.card_pass カードパスワード
 * @param {string} args.expire 有効期限 名義人
 * @param {string} args.holder_name
 * @returns {IUncheckedCardRaw} 生の有効性確認前GMOカード
 * @memberof factory/card/gmo
 */
function createUncheckedCardRaw(args) {
    // todo validation
    return args;
}
exports.createUncheckedCardRaw = createUncheckedCardRaw;
/**
 * トークン化有効性確認前GMOカードを作成する
 *
 * @export
 * @param {string} args.token
 * @returns {IUncheckedCardTokenized} トークン化有効性確認前GMOカード
 * @memberof factory/card/gmo
 */
function createUncheckedCardTokenized(args) {
    // todo validation
    return args;
}
exports.createUncheckedCardTokenized = createUncheckedCardTokenized;
