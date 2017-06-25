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
     * カードグループ
     */
    group: CardGroup;
}
