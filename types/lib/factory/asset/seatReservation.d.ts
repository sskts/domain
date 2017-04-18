import * as AssetFactory from '../asset';
import * as AuthorizationFactory from '../authorization';
import * as OwnershipFactory from '../ownership';
/**
 * 座席予約資産
 *
 * @interface ISeatReservationAsset
 * @extends {IAsset}
 * @memberof tobereplaced$
 */
export interface ISeatReservationAsset extends AssetFactory.IAsset {
    ownership: OwnershipFactory.IOwnership;
    /**
     * パフォーマンス
     */
    performance: string;
    /**
     * スクリーンセクション
     */
    section: string;
    /**
     * 座席コード
     */
    seat_code: string;
    /**
     * 券種コード
     */
    ticket_code: string;
    /**
     * 券種名
     */
    ticket_name_ja: string;
    /**
     * 券種名(英)
     */
    ticket_name_en: string;
    /**
     * 券種名(カナ)
     */
    ticket_name_kana: string;
    /**
     * 標準単価
     */
    std_price: number;
    /**
     * 加算単価
     */
    add_price: number;
    /**
     * 割引額
     */
    dis_price: number;
    /**
     * 販売単価
     */
    sale_price: number;
    /**
     * ムビチケ計上単価
     */
    mvtk_app_price: number;
    /**
     * メガネ単価
     */
    add_glasses: number;
    /**
     * ムビチケ映写方式区分
     */
    kbn_eisyahousiki: string;
}
/**
 * 座席予約資産を作成する
 *
 * @returns {SeatReservationAsset}
 * @memberof tobereplaced$
 */
export declare function create(args: {
    id?: string;
    ownership: OwnershipFactory.IOwnership;
    authorizations?: AuthorizationFactory.IAuthorization[];
    performance: string;
    section: string;
    seat_code: string;
    ticket_code: string;
    ticket_name_ja: string;
    ticket_name_en: string;
    ticket_name_kana: string;
    std_price: number;
    add_price: number;
    dis_price: number;
    sale_price: number;
    mvtk_app_price: number;
    add_glasses: number;
    kbn_eisyahousiki: string;
}): ISeatReservationAsset;
