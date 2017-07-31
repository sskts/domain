/**
 * 場所サービス
 *
 * @namespace service/place
 */

import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';
import * as monapt from 'monapt';

import IMultilingualString from '../factory/multilingualString';
import * as MovieTheaterPlaceFactory from '../factory/place/movieTheater';
import PlaceType from '../factory/placeType';

import PlaceAdapter from '../adapter/place';

const debug = createDebug('sskts-domain:service:place');

export type IPlaceOperation<T> = (placeAdapter: PlaceAdapter) => Promise<T>;

/**
 * 劇場インポート
 */
export function importMovieTheater(theaterCode: string): IPlaceOperation<void> {
    return async (placeAdapter: PlaceAdapter) => {
        const movieTheater = MovieTheaterPlaceFactory.createFromCOA(
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
 * 劇場検索条件インターフェース
 */
export interface ISearchMovieTheatersConditions {
    name?: string;
}

/**
 * 劇場検索結果インターフェース
 */
export interface ISearchMovieTheaterResult {
    /**
     * スキーマタイプ
     */
    typeOf: string;
    /**
     * 枝番号
     */
    branchCode: string;
    /**
     * 劇場名称
     */
    name: IMultilingualString;
    /**
     * 劇場カナ名称
     */
    kanaName: string;
    /**
     * 劇場URL
     */
    url?: string;
}

/**
 * 劇場検索
 */
export function searchMovieTheaters(searchConditions: ISearchMovieTheatersConditions): IPlaceOperation<ISearchMovieTheaterResult[]> {
    return async (placeAdapter: PlaceAdapter) => {
        // 検索条件を作成
        const conditions: any = {
            typeOf: PlaceType.MovieTheater
        };
        debug('searchConditions:', searchConditions);

        // todo 検索条件を指定できるように改修

        debug('finding places...', conditions);

        return await placeAdapter.placeModel.find(conditions, 'typeOf branchCode name kanaName url')
            .setOptions({ maxTimeMS: 10000 })
            .exec()
            .then((docs) => {
                return docs.map((doc) => {
                    const movieTheater = <MovieTheaterPlaceFactory.IPlace>doc.toObject();

                    return {
                        typeOf: movieTheater.typeOf,
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
export function findMovieTheaterByBranchCode(branchCode: string): IPlaceOperation<monapt.Option<MovieTheaterPlaceFactory.IPlace>> {
    return async (placeAdapter: PlaceAdapter) => {
        return await placeAdapter.placeModel.findOne({
            typeOf: PlaceType.MovieTheater,
            branchCode: branchCode
        }).lean()
            .exec()
            .then((movieTheater: MovieTheaterPlaceFactory.IPlace) => (movieTheater === null) ? monapt.None : monapt.Option(movieTheater));
    };
}
