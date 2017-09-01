/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import placeModel from './mongoose/model/place';
/**
 * 場所レポジトリー
 *
 * @class PlaceRepository
 */
export default class PlaceRepository {
    readonly placeModel: typeof placeModel;
    constructor(connection: Connection);
    /**
     * save a movie theater
     * 劇場を保管する
     * @param movieTheater movieTheater object
     */
    saveMovieTheater(movieTheater: factory.place.movieTheater.IPlace): Promise<void>;
    /**
     * 劇場検索
     */
    searchMovieTheaters(searchConditions: {}): Promise<factory.place.movieTheater.IPlaceWithoutScreeningRoom[]>;
    /**
     * 枝番号で劇場検索
     */
    findMovieTheaterByBranchCode(branchCode: string): Promise<factory.place.movieTheater.IPlace>;
}
