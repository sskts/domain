/**
 * GMOカードファクトリー
 *
 * @namespace factory/card/gmo
 */
import * as CardFactory from '../card';
/**
 * GMOカードインターフェース
 *
 * todo gmo-serviceの定義に合わせる
 *
 * @interface IGMOCard
 * @extends {CardFactory.ICard}
 */
export interface IGMOCard extends CardFactory.ICard {
    card_name: string;
    card_no: string;
    expire: string;
    holder_name: string;
}
