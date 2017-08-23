/**
 * GMOカードIDファクトリー
 *
 * @namespace factory/cardId/gmo
 */
import CardGroup from '../cardGroup';
/**
 * GMOカードIDクラス
 *
 * @export
 * @class GMOCardId
 */
export declare class GMOCardId {
    static ID_SEPARATER: string;
    /**
     * カードグループ
     *
     * @type {CardGroup}
     * @memberof GMOCardId
     */
    readonly cardGroup: CardGroup;
    /**
     * カード連番
     *
     * @type {string}
     * @memberof GMOCardId
     */
    readonly cardSeq: string;
    constructor(cardGroup: CardGroup, cardSeq: string);
    toString(): string;
}
/**
 * GMOカードIDを生成する
 *
 * @export
 * @param {CardGroup} group カードグループ
 * @param {string} cardSeq カード連番
 * @returns {GMOCardId} GMOカードID
 */
export declare function create(cardGroup: CardGroup, cardSeq: string): GMOCardId;
/**
 * ID文字列からGMOカードIDを生成する
 *
 * @export
 * @param {string} id ID文字列
 * @returns {GMOCardId} GMOカードID
 */
export declare function parse(id: string): GMOCardId;
