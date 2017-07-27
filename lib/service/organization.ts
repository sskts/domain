/**
 * 組織サービス
 *
 * @namespace service/organization
 */

import * as createDebug from 'debug';

import IMultilingualString from '../factory/multilingualString';
import * as MovieTheaterOrganizationFactory from '../factory/organization/movieTheater';
import OrganizationType from '../factory/organizationType';

import OrganizationAdapter from '../adapter/organization';

const debug = createDebug('sskts-domain:service:organization');

export type IOrganizationOperation<T> = (organizationAdapter: OrganizationAdapter) => Promise<T>;

export interface ISearchMovieTheatersConditions {
    name?: string;
}

export interface ISearchMovieTheaterResult {
    id: string;
    location: MovieTheaterOrganizationFactory.ILocation;
    name: IMultilingualString;
    // kanaName: string;
    sameAs?: string;
}

/**
 * 劇場検索
 */
export function searchMovieTheaters(searchConditions: ISearchMovieTheatersConditions): IOrganizationOperation<ISearchMovieTheaterResult[]> {
    return async (organizationAdapter: OrganizationAdapter) => {
        // 検索条件を作成
        const conditions: any = {
            typeOf: OrganizationType.MovieTheater
        };
        debug('searchConditions:', searchConditions);

        // todo 検索条件を指定できるように改修

        debug('finding places...', conditions);

        return await organizationAdapter.organizationModel.find(conditions, 'typeOf location name kanaName sameAs')
            .setOptions({ maxTimeMS: 10000 })
            .exec()
            .then((docs) => {
                return docs.map((doc) => {
                    const movieTheater = <MovieTheaterOrganizationFactory.IOrganization>doc.toObject();

                    return {
                        id: movieTheater.id,
                        typeOf: movieTheater.typeOf,
                        location: movieTheater.location,
                        name: movieTheater.name,
                        // kanaName: movieTheater.kanaName,
                        sameAs: movieTheater.sameAs
                    };
                });

            });
    };
}
