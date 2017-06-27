/**
 * GMOカードファクトリー
 *
 * @namespace factory/card/gmo
 */

import * as GMO from '@motionpicture/gmo-service';

import * as CardFactory from '../card';
import CardGroup from '../cardGroup';

export interface ICheckedCard extends CardFactory.ICard {
    /**
     * カード登録連番
     */
    card_seq: string;
    /**
     * カード会社略称
     */
    card_name: string;
    /**
     * カード番号
     */
    card_no: string;
    /**
     * 有効期限
     */
    expire: string;
    /**
     * 名義人
     */
    holder_name: string;
}

/**
 * 生の有効性確認前GMOカードインターフェース
 *
 * todo gmo-serviceの定義に合わせる
 *
 * @interface IUncheckedCardRaw
 * @extends {CardFactory.ICard}
 */
export interface IUncheckedCardRaw extends CardFactory.ICard {
    card_no: string;
    card_pass: string;
    expire: string;
    holder_name: string;
}

/**
 * トークン化有効性確認前GMOカードインターフェース
 *
 * @interface IUncheckedCardTokenized
 * @extends {CardFactory.ICard}
 */
export interface IUncheckedCardTokenized extends CardFactory.ICard {
    token: string;
}

export function createCheckedCardFromGMOSearchCardResult(args: GMO.services.card.ISearchCardResult): ICheckedCard {
    return {
        group: CardGroup.GMO,
        card_seq: args.cardSeq,
        card_name: args.cardName,
        card_no: args.cardNo,
        expire: args.expire,
        holder_name: args.holderName
    };
}
