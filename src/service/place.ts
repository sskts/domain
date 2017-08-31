/**
 * 場所サービス
 *
 * @namespace service/place
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import PlaceRepository from '../repo/place';

const debug = createDebug('sskts-domain:service:place');

export type IPlaceOperation<T> = (placeRepository: PlaceRepository) => Promise<T>;

/**
 * 劇場インポート
 */
export function importMovieTheater(theaterCode: string): IPlaceOperation<void> {
    return async (placeRepository: PlaceRepository) => {
        const movieTheater = factory.place.movieTheater.createFromCOA(
            await COA.services.master.theater({ theaterCode: theaterCode }),
            await COA.services.master.screen({ theaterCode: theaterCode })
        );

        debug('storing movieTheater...', movieTheater);
        await placeRepository.placeModel.findOneAndUpdate(
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
    return async (placeRepository: PlaceRepository) => {
        // 検索条件を作成
        const conditions: any = {
            typeOf: factory.placeType.MovieTheater
        };
        debug('searchConditions:', searchConditions);

        // todo 検索条件を指定できるように改修

        debug('finding places...', conditions);

        return await placeRepository.placeModel.find(conditions, 'typeOf branchCode name kanaName url')
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
): IPlaceOperation<factory.place.movieTheater.IPlace> {
    return async (placeRepository: PlaceRepository) => {
        const doc = await placeRepository.placeModel.findOne({
            typeOf: factory.placeType.MovieTheater,
            branchCode: branchCode
        }).exec();

        if (doc === null) {
            throw new factory.errors.NotFound('movieTheater');
        }

        return <factory.place.movieTheater.IPlace>doc.toObject();
    };
}
