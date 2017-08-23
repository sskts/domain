/**
 * 在庫状況ファクトリー
 * todo jsdoc
 *
 * @namespace factory/stockStatus
 */

import StockStatusGroup from './stockStatusGroup';

/**
 * 在庫状況インターフェース
 * 表現は、在庫状況単位によって変わると思われる(基本的に文字列)
 *
 * @interface IStockStatus
 */
export interface IStockStatus {
    /**
     * ID
     *
     * @type {string}
     * @memberof IStockStatus
     */
    id: string;
    /**
     * 在庫状況グループ
     *
     * @type {StockStatusGroup}
     * @memberof IStockStatus
     */
    group: StockStatusGroup;
    /**
     * 在庫状況表現
     *
     * @type {string}
     * @memberof IStockStatus
     */
    expression: any;
}
