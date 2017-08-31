/**
 * マスタサービス
 *
 * @namespace service/creativeWork
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import CreativeWorkRepository from '../repository/creativeWork';

const debug = createDebug('sskts-domain:service:creativeWork');

/**
 * 映画作品インポート
 */
export function importMovies(theaterCode: string) {
    return async (creativeWorkRepository: CreativeWorkRepository) => {
        // COAから作品取得
        const filmsFromCOA = await COA.services.master.title({ theaterCode: theaterCode });

        // 永続化
        await Promise.all(filmsFromCOA.map(async (filmFromCOA) => {
            const movie = factory.creativeWork.movie.createFromCOA(filmFromCOA);
            debug('storing movie...', movie);
            await creativeWorkRepository.creativeWorkModel.findOneAndUpdate(
                {
                    identifier: movie.identifier,
                    typeOf: factory.creativeWorkType.Movie
                },
                movie,
                { upsert: true }
            ).exec();
            debug('movie stored.');
        }));
    };
}
