/**
 * ショップサービス
 *
 * @namespace service/shop
 */

import * as TheaterFactory from '../factory/theater';

import TheaterAdapter from '../adapter/theater';

export type ITheaterOperation<T> = (adapter: TheaterAdapter) => Promise<T>;

export function open(theater: TheaterFactory.ITheater): ITheaterOperation<void> {
    return async (theaterAdapter: TheaterAdapter) => {
        await theaterAdapter.model.findByIdAndUpdate(
            theater.id,
            {
                // 存在しない場合のみ更新(既にあれば何もしない)
                $setOnInsert: theater
            },
            { upsert: true }
        ).exec();
    };
}
