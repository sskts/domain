/**
 * 映画ファクトリー
 *
 * @namespace factory/creativeWork/movie
 */
import * as COA from '@motionpicture/coa-service';
import * as CreativeWorkFactory from '../creativeWork';
export interface ICreativeWork extends CreativeWorkFactory.ICreativeWork {
    identifier: string;
    name: string;
    duration: string;
    contentRating: string;
}
/**
 * COAの作品抽出結果からFilmオブジェクトを作成する
 */
export declare function createFromCOA(filmFromCOA: COA.services.master.ITitleResult): ICreativeWork;
