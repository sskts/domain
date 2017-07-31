/**
 * 所有権ファクトリー
 *
 * @namespace factory/ownership
 */

import * as ReservationFactory from './reservation';

/**
 * 所有者インターフェース
 */
export interface IOwner {
    typeOf: string;
    id: string;
    name: string;
}

/**
 * 所有権インターフェース
 */
export interface IOwnership {
    /**
     * 所有権識別子
     */
    identifier: string;
    /**
     * 所有者
     */
    ownedBy: IOwner;
    /**
     * 誰から取得した所有権か
     * The organization or person from which the product was acquired.
     */
    acquiredFrom: IOwner;
    /**
     * 所有権取得日時
     * The date and time of obtaining the product.
     */
    ownedFrom: Date;
    /**
     * 所有権無効化日時
     * The date and time of giving up ownership on the product.
     */
    ownedThrough: Date;
    /**
     * 所有対象
     * 商品や予約情報が含まれます。
     * The product that this structured value is referring to.
     */
    typeOfGood: ReservationFactory.IReservation;
}

export function create(args: {
    ownedBy: IOwner;
    acquiredFrom: IOwner;
    ownedFrom: Date;
    ownedThrough: Date;
    typeOfGood: ReservationFactory.IReservation;
}): IOwnership {
    return {
        identifier: `Reservation-${args.typeOfGood.reservationNumber}`, // todo 所有権の固有値仕様を決定
        ownedBy: args.ownedBy,
        acquiredFrom: args.acquiredFrom,
        ownedFrom: args.ownedFrom,
        ownedThrough: args.ownedThrough,
        typeOfGood: args.typeOfGood
    };
}
