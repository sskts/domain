/**
 * GMOカードファクトリー
 *
 * @namespace factory/card/gmo
 */
import * as CardFactory from '../card';
/**
 * 生GMOカードインターフェース
 *
 * todo gmo-serviceの定義に合わせる
 *
 * @interface IGMOCardRaw
 * @extends {CardFactory.ICard}
 */
export interface IGMOCardRaw extends CardFactory.ICard {
    cardNo: string;
    cardPass: string;
    expire: string;
    holderName: string;
}
/**
 * トークン化GMOカードインターフェース
 *
 * @interface IGMOCardTokenized
 * @extends {CardFactory.ICard}
 */
export interface IGMOCardTokenized extends CardFactory.ICard {
    token: string;
}
