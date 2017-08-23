"use strict";
/**
 * GMOカードIDファクトリー
 *
 * @namespace factory/cardId/gmo
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * GMOカードIDクラス
 *
 * @export
 * @class GMOCardId
 */
class GMOCardId {
    constructor(cardGroup, cardSeq) {
        this.cardGroup = cardGroup;
        this.cardSeq = cardSeq;
    }
    toString() {
        return `${this.cardGroup}${GMOCardId.ID_SEPARATER}${this.cardSeq}`;
    }
}
GMOCardId.ID_SEPARATER = ':';
exports.GMOCardId = GMOCardId;
/**
 * GMOカードIDを生成する
 *
 * @export
 * @param {CardGroup} group カードグループ
 * @param {string} cardSeq カード連番
 * @returns {GMOCardId} GMOカードID
 */
function create(cardGroup, cardSeq) {
    // todo validation
    return new GMOCardId(cardGroup, cardSeq);
}
exports.create = create;
/**
 * ID文字列からGMOカードIDを生成する
 *
 * @export
 * @param {string} id ID文字列
 * @returns {GMOCardId} GMOカードID
 */
function parse(id) {
    // todo validation
    const attributes = id.split(GMOCardId.ID_SEPARATER);
    return new GMOCardId(attributes[0], attributes[1]);
}
exports.parse = parse;
