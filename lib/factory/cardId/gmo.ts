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
export class GMOCardId {
    public static ID_SEPARATER: string = ':';

    /**
     * カードグループ
     *
     * @type {CardGroup}
     * @memberof GMOCardId
     */
    public readonly cardGroup: CardGroup;
    /**
     * カード連番
     *
     * @type {string}
     * @memberof GMOCardId
     */
    public readonly cardSeq: string;

    constructor(cardGroup: CardGroup, cardSeq: string) {
        this.cardGroup = cardGroup;
        this.cardSeq = cardSeq;
    }

    public toString() {
        return `${this.cardGroup}${GMOCardId.ID_SEPARATER}${this.cardSeq}`;
    }
}

/**
 * GMOカードIDを生成する
 *
 * @export
 * @param {CardGroup} group カードグループ
 * @param {string} cardSeq カード連番
 * @returns {GMOCardId} GMOカードID
 */
export function create(cardGroup: CardGroup, cardSeq: string): GMOCardId {
    // todo validation

    return new GMOCardId(cardGroup, cardSeq);
}

/**
 * ID文字列からGMOカードIDを生成する
 *
 * @export
 * @param {string} id ID文字列
 * @returns {GMOCardId} GMOカードID
 */
export function parse(id: string): GMOCardId {
    // todo validation

    const attributes = id.split(GMOCardId.ID_SEPARATER);

    return new GMOCardId(<CardGroup>attributes[0], attributes[1]);
}
