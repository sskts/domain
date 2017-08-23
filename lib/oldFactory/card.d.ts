/**
 * カードファクトリー
 *
 * @namespace factory/card
 */
import CardGroup from './cardGroup';
/**
 * カードインターフェース
 *
 * @interface ICard
 * @memberof factory/card
 */
export interface ICard {
    /**
     * ID
     */
    id: any;
    /**
     * 所有者ID
     */
    owner: string;
    /**
     * カードグループ
     */
    group: CardGroup;
}
