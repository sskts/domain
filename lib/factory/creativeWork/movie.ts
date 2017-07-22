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
        identifier: filmFromCOA.title_code,
        name: filmFromCOA.title_name_orig,
        duration: moment.duration(filmFromCOA.show_time, 'm').toISOString(),
        contentRating: filmFromCOA.kbn_eirin,
        typeOf: CreativeWorkType.Movie
    };
}
