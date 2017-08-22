/**
 * 場所サービス
 *
 * @namespace service/place
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as monapt from 'monapt';

import PlaceAdapter from '../adapter/place';

const debug = createDebug('sskts-domain:service:place');

export type IPlaceOperation<T> = (placeAdapter: PlaceAdapter) => Promise<T>;

/**
 * 劇場インポート
 */
export function importMovieTheater(theaterCode: string): IPlaceOperation<void> {
    return async (placeAdapter: PlaceAdapter) => {
        const movieTheater = factory.place.movieTheater.createFromCOA(
            await COA.services.master.theater({ theaterCode: theaterCode }),
            await COA.services.master.screen({ theaterCode: theaterCode })
        );

        debug('storing movieTheater...', movieTheater);
        await placeAdapter.placeModel.findOneAndUpdate(
            {
                branchCode: movieTheater.branchCode
            },
            movieTheater,
            { upsert: true }
        ).exec();
        debug('movieTheater stored.');
    };
}

/**
 * 劇場検索
 */
export function searchMovieTheaters(
    searchConditions: {}
): IPlaceOperation<factory.place.movieTheater.IPlaceWithoutScreeningRoom[]> {
    return async (placeAdapter: PlaceAdapter) => {
        // 検索条件を作成
        const conditions: any = {
            typeOf: factory.placeType.MovieTheater
        };
        debug('searchConditions:', searchConditions);

        // todo 検索条件を指定できるように改修

        debug('finding places...', conditions);

        return await placeAdapter.placeModel.find(conditions, 'typeOf branchCode name kanaName url')
            .setOptions({ maxTimeMS: 10000 })
            .exec()
            .then((docs) => {
                return docs.map((doc) => {
                    const movieTheater = <factory.place.movieTheater.IPlace>doc.toObject();

                    return {
                        typeOf: movieTheater.typeOf,
                        screenCount: movieTheater.screenCount,
                        branchCode: movieTheater.branchCode,
                        name: movieTheater.name,
                        kanaName: movieTheater.kanaName,
                        url: movieTheater.url
                    };
                });

            });
    };
}

/**
 * 枝番号で劇場検索
 */
export function findMovieTheaterByBranchCode(
    branchCode: string
): IPlaceOperation<monapt.Option<factory.place.movieTheater.IPlace>> {
    return async (placeAdapter: PlaceAdapter) => {
        return await placeAdapter.placeModel.findOne({
            typeOf: factory.placeType.MovieTheater,
            branchCode: branchCode
        }).lean()
            .exec()
            .then((movieTheater: factory.place.movieTheater.IPlace) => (movieTheater === null) ? monapt.None : monapt.Option(movieTheater));
    };
}
