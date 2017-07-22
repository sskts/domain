/**
 * 劇場の上映イベントファクトリー
 *
 * @namespace factory/creativeWork/movie
 */
import * as COA from '@motionpicture/coa-service';
import CreativeWorkType from '../creativeWorkType';
import * as EventFactory from '../event';
import IMultilingualString from '../multilingualString';
import * as MovieTheaterPlaceFactory from '../place/movieTheater';
import PlaceType from '../placeType';
export interface IEvent extends EventFactory.IEvent {
    videoFormat: string;
    workPerformed: {
        identifier: string;
        name: string;
        duration: string;
        contentRating: string;
        typeOf: CreativeWorkType;
    };
    location: {
        typeOf: PlaceType;
        branchCode: string;
        name: IMultilingualString;
        kanaName: string;
    };
    kanaName: string;
    alternativeHeadline: string;
    name: IMultilingualString;
    endDate?: Date;
    startDate?: Date;
    coaInfo: {
        titleBranchNum: string;
        kbnJoueihousiki: string;
        kbnJimakufukikae: string;
        /**
         * ムビチケ使用フラグ
         * 1：ムビチケ使用対象
         */
        flgMvtkUse: string;
        /**
         * ムビチケ利用開始日
         * ※日付は西暦8桁 "YYYYMMDD"
         */
        dateMvtkBegin: string;
    };
}
/**
 * COAの作品抽出結果からFilmオブジェクトを作成する
 */
export declare function createFromCOA(filmFromCOA: COA.services.master.ITitleResult): (movieTheater: MovieTheaterPlaceFactory.IPlace) => IEvent;
export declare function createIdentifier(theaterCode: string, titleCode: string, titleBranchNum: string): string;
