/**
 * マスターデータ同期サービス
 * @namespace service.masterSync
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
// @ts-ignore
import * as difference from 'lodash.difference';
import * as moment from 'moment-timezone';

import { Repository as CreativeWorkRepo } from '../repo/creativeWork';
import { Repository as EventRepo } from '../repo/event';
import { Repository as PlaceRepo } from '../repo/place';

const debug = createDebug('sskts-domain:service:masterSync');

export type IPlaceOperation<T> = (placeRepo: PlaceRepo) => Promise<T>;

/**
 * 映画作品インポート
 */
export function importMovies(theaterCode: string) {
    return async (repos: { creativeWork: CreativeWorkRepo }) => {
        // COAから作品取得
        const filmsFromCOA = await COA.services.master.title({ theaterCode: theaterCode });

        // 永続化
        await Promise.all(filmsFromCOA.map(async (filmFromCOA) => {
            const movie = factory.creativeWork.movie.createFromCOA(filmFromCOA);
            debug('storing movie...', movie);
            await repos.creativeWork.saveMovie(movie);
            debug('movie stored.');
        }));
    };
}

export function matchWithXML(
    xmlSchedule: COA.services.master.IXMLScheduleResult[],
    coaSchedule: COA.services.master.IScheduleResult
): boolean {
    const matchSchedule = xmlSchedule.find((schedule) => {
        if (schedule.date !== coaSchedule.dateJouei) { return false; }
        const matchMovie = schedule.movie.find((movie) => {
            if (movie.movieShortCode !== coaSchedule.titleCode) { return false; }
            const matchScreen = movie.screen.find((screen) => {
                if (screen.screenCode !== coaSchedule.screenCode) { return false; }
                const matchTime = screen.time.find((time) => {
                    if (time.startTime !== coaSchedule.timeBegin || time.endTime !== coaSchedule.timeEnd) {
                        return false;
                    } else {
                        return true;
                    }
                });
                if (matchTime !== undefined) {
                    return true;
                } else {
                    return false;
                }
            });
            if (matchScreen !== undefined) {
                return true;
            } else {
                return false;
            }
        });
        if (matchMovie !== undefined) {
            return true;
        } else {
            return false;
        }
    });
    if (matchSchedule !== undefined) {
        return true;
    } else {
        return false;
    }
}

/**
 * COAから上映イベントをインポートする
 * @param theaterCode 劇場コード
 * @param importFrom いつから
 * @param importThrough いつまで
 * @param xmlEndPoint XMLスケジュールのエンドポイント
 */
export function importScreeningEvents(
    theaterCode: string,
    importFrom: Date,
    importThrough: Date,
    xmlEndPoint?: { baseUrl: string; theaterCodeName: string }
) {
    // tslint:disable-next-line:max-func-body-length
    return async (repos: {
        event: EventRepo;
        place: PlaceRepo;
    }) => {
        // 劇場取得
        const movieTheater = await repos.place.findMovieTheaterByBranchCode(theaterCode);

        // COAから作品取得
        const filmsFromCOA = await COA.services.master.title({
            theaterCode: theaterCode
        });

        const targetImportFrom = moment(`${moment(importFrom).tz('Asia/Tokyo').format('YYYY-MM-DD')}T00:00:00+09:00`);
        const targetImportThrough = moment(`${moment(importThrough).tz('Asia/Tokyo').format('YYYY-MM-DD')}T00:00:00+09:00`).add(1, 'day');
        debug('importing screening events...', targetImportFrom, targetImportThrough);

        // COAから上映イベント取得
        debug(
            'finding schedules from COA...',
            moment(targetImportFrom).tz('Asia/Tokyo').format('YYYYMMDD'),
            moment(targetImportThrough).add(-1, 'day').tz('Asia/Tokyo').format('YYYYMMDD')
        );
        const schedulesFromCOA = await COA.services.master.schedule({
            theaterCode: theaterCode,
            begin: moment(targetImportFrom).tz('Asia/Tokyo').format('YYYYMMDD'), // COAは日本時間で判断
            end: moment(targetImportThrough).add(-1, 'day').tz('Asia/Tokyo').format('YYYYMMDD') // COAは日本時間で判断
        });

        let schedulesFromXML: COA.services.master.IXMLScheduleResult[] = [];
        if (xmlEndPoint !== undefined) {
            try {
                schedulesFromXML = await COA.services.master.xmlSchedule({
                    baseUrl: xmlEndPoint.baseUrl,
                    theaterCodeName: xmlEndPoint.theaterCodeName
                });
            } catch (err) {
                console.error(err);
            }
        }

        // xmlEndPointがない場合、処理を続きます
        if (xmlEndPoint === undefined || schedulesFromXML.length > 0) {
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
            debug('kubunNames found.');

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
                await repos.event.saveScreeningEvent(screeningEvent);

                return screeningEvent;
            }));

            // 上映イベントごとに永続化トライ
            const individualScreeningEvents: factory.event.individualScreeningEvent.IEvent[] = [];
            schedulesFromCOA.forEach((scheduleFromCOA) => {
                if (xmlEndPoint === undefined || matchWithXML(schedulesFromXML, scheduleFromCOA)) {
                    const screeningEventIdentifier = factory.event.screeningEvent.createIdentifier({
                        theaterCode: theaterCode,
                        titleCode: scheduleFromCOA.titleCode,
                        titleBranchNum: scheduleFromCOA.titleBranchNum
                    });

                    // スクリーン存在チェック
                    const screenRoom = <factory.place.movieTheater.IScreeningRoom | undefined>movieTheater.containsPlace.find(
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
                    individualScreeningEvents.push(individualScreeningEvent);
                }
            });

            debug(`storing ${individualScreeningEvents.length} individualScreeningEvents...`);
            await Promise.all(individualScreeningEvents.map(async (individualScreeningEvent) => {
                try {
                    await repos.event.saveIndividualScreeningEvent(individualScreeningEvent);
                } catch (error) {
                    // tslint:disable-next-line:no-single-line-block-comment
                    /* istanbul ignore next */
                    console.error(error);
                }
            }));
            debug(`${individualScreeningEvents.length} individualScreeningEvents stored.`);

            // COAから削除されたイベントをキャンセル済ステータスへ変更
            const identifiers = await repos.event.searchIndividualScreeningEvents({
                superEventLocationIdentifiers: [`MovieTheater-${theaterCode}`],
                startFrom: targetImportFrom.toDate(),
                startThrough: targetImportThrough.toDate()
            }).then((events) => events.map((e) => e.identifier));
            const identifiersShouldBe = individualScreeningEvents.map((e) => e.identifier);
            const cancelledIdentifiers = difference(identifiers, identifiersShouldBe);
            debug(`cancelling ${cancelledIdentifiers.length} events...`);
            await Promise.all(cancelledIdentifiers.map(async (identifier) => {
                try {
                    await repos.event.cancelIndividualScreeningEvent(identifier);
                } catch (error) {
                    // tslint:disable-next-line:no-single-line-block-comment
                    /* istanbul ignore next */
                    console.error(error);
                }
            }));
            debug(`${cancelledIdentifiers.length} events cancelled.`);
        }
    };
}

/**
 * 劇場インポート
 */
export function importMovieTheater(theaterCode: string): IPlaceOperation<void> {
    return async (placeRepo: PlaceRepo) => {
        const movieTheater = factory.place.movieTheater.createFromCOA(
            await COA.services.master.theater({ theaterCode: theaterCode }),
            await COA.services.master.screen({ theaterCode: theaterCode })
        );

        debug('storing movieTheater...', movieTheater);
        await placeRepo.saveMovieTheater(movieTheater);
        debug('movieTheater stored.');
    };
}
