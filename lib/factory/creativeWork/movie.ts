/**
 * 映画ファクトリー
 *
 * @namespace factory/creativeWork/movie
 */

import * as COA from '@motionpicture/coa-service';
import * as moment from 'moment';

import * as CreativeWorkFactory from '../creativeWork';
import CreativeWorkType from '../creativeWorkType';

export interface ICreativeWork extends CreativeWorkFactory.ICreativeWork {
    identifier: string;
    name: string;
    duration: string; // 上映時間
    contentRating: string; // 映倫区分(PG12,R15,R18)
}

/**
 * COAの作品抽出結果からFilmオブジェクトを作成する
 */
export function createFromCOA(filmFromCOA: COA.services.master.ITitleResult): ICreativeWork {
    return {
        identifier: filmFromCOA.titleCode,
        name: filmFromCOA.titleNameOrig,
        duration: moment.duration(filmFromCOA.showTime, 'm').toISOString(),
        contentRating: filmFromCOA.kbnEirin,
        typeOf: CreativeWorkType.Movie
    };
}
