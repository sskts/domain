/**
 * master data synchronization service
 * マスターデータ同期サービス
 * @namespace service/masterSync
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';

import { Repository as CreativeWorkRepository } from '../repo/creativeWork';
import { Repository as EventRepository } from '../repo/event';
import { Repository as PlaceRepository } from '../repo/place';

const debug = createDebug('sskts-domain:service:masterSync');

export type IPlaceOperation<T> = (placeRepository: PlaceRepository) => Promise<T>;

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
            await creativeWorkRepository.saveMovie(movie);
            debug('movie stored.');
        }));
    };
}

/**
 * import screening events from COA
 * COAから上映イベントをインポートする
 * @export
 * @function
 * @memberof service/event
 */
export function importScreeningEvents(theaterCode: string, importFrom: Date, importThrough: Date) {
    // tslint:disable-next-line:max-func-body-length
    return async (eventRepository: EventRepository, placeRepository: PlaceRepository) => {
        // 劇場取得
        const movieTheater = await placeRepository.findMovieTheaterByBranchCode(theaterCode);

        // COAから作品取得
        const filmsFromCOA = await COA.services.master.title({
            theaterCode: theaterCode
        });

        // COAからパフォーマンス取得
        const schedulesFromCOA = await COA.services.master.schedule({
            theaterCode: theaterCode,
            begin: moment(importFrom).locale('ja').format('YYYYMMDD'),
            end: moment(importThrough).locale('ja').format('YYYYMMDD')
        });

        // COAから区分マスター抽出
        const serviceKubuns = await COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '009'
        });
        const acousticKubuns = await COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '046'
        });
        const eirinKubuns = await COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '044'
        });
        const eizouKubuns = await COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '042'
        });
        const joueihousikiKubuns = await COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '045'
        });
        const jimakufukikaeKubuns = await COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '043'
        });
        debug(serviceKubuns, acousticKubuns, eirinKubuns, eizouKubuns, joueihousikiKubuns, jimakufukikaeKubuns);

        // 永続化
        const screeningEvents = await Promise.all(filmsFromCOA.map(async (filmFromCOA) => {
            const screeningEvent = factory.event.screeningEvent.createFromCOA({
                filmFromCOA: filmFromCOA,
                movieTheater: movieTheater,
                eirinKubuns: eirinKubuns,
                eizouKubuns: eizouKubuns,
                joueihousikiKubuns: joueihousikiKubuns,
                jimakufukikaeKubuns: jimakufukikaeKubuns
            });
            debug('storing screeningEvent...', filmFromCOA, screeningEvent);
            await eventRepository.saveScreeningEvent(screeningEvent);
            debug('screeningEvent stored.');

            return screeningEvent;
        }));

        // パフォーマンスごとに永続化トライ
        await Promise.all(schedulesFromCOA.map(async (scheduleFromCOA) => {
            const screeningEventIdentifier = factory.event.screeningEvent.createIdentifier(
                theaterCode, scheduleFromCOA.titleCode, scheduleFromCOA.titleBranchNum
            );

            // スクリーン存在チェック
            const screenRoom = movieTheater.containsPlace.find(
                (place) => place.branchCode === scheduleFromCOA.screenCode
            );
            if (screenRoom === undefined) {
                console.error('screenRoom not found.', scheduleFromCOA.screenCode);

                return;
            }

            // 上映イベント取得
            const screeningEvent = screeningEvents.find((event) => event.identifier === screeningEventIdentifier);
            if (screeningEvent === undefined) {
                console.error('screeningEvent not found.', screeningEventIdentifier);

                return;
            }

            // 永続化
            const individualScreeningEvent = factory.event.individualScreeningEvent.createFromCOA({
                performanceFromCOA: scheduleFromCOA,
                screenRoom: screenRoom,
                screeningEvent: screeningEvent,
                serviceKubuns: serviceKubuns,
                acousticKubuns: acousticKubuns
            });
            debug('storing individualScreeningEvent', individualScreeningEvent);
            await eventRepository.saveIndividualScreeningEvent(individualScreeningEvent);
            debug('individualScreeningEvent stored.');
        }));
    };
}

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
        await placeRepository.saveMovieTheater(movieTheater);
        debug('movieTheater stored.');
    };
}
