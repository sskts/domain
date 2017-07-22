/**
 * 所有権ファクトリー
 *
 * @namespace factory/ownership
 */

import * as ReservationFactory from './reservation';

export enum OwnerType {
    Organization = 'Organization',
    Person = 'Person'
}

export interface IOwner {
    typeOf: string;
    id: string;
    name: string;
}

export interface IOwnership {
    identifier: string;
    /**
     * The organization or person from which the product was acquired.
     */
    acquiredFrom: IOwner;
    /**
     * The date and time of obtaining the product.
     */
    ownedFrom: Date;
    /**
     * The date and time of giving up ownership on the product.
     */
    ownedThrough: Date;
    /**
     * The product that this structured value is referring to.
     */
    typeOfGood: ReservationFactory.IReservation;
}

export function create(args: {
    acquiredFrom: IOwner;
    ownedFrom: Date;
    ownedThrough: Date;
    typeOfGood: ReservationFactory.IReservation;
}): IOwnership {
    return {
        identifier: `Reservation-${args.typeOfGood.reservationNumber}`, // todo 所有権の固有値仕様を決定
        acquiredFrom: args.acquiredFrom,
        ownedFrom: args.ownedFrom,
        ownedThrough: args.ownedThrough,
        typeOfGood: args.typeOfGood
    };
}
