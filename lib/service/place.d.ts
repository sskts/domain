import * as factory from '@motionpicture/sskts-factory';
import PlaceRepository from '../repository/place';
export declare type IPlaceOperation<T> = (placeRepository: PlaceRepository) => Promise<T>;
/**
 * 劇場インポート
 */
export declare function importMovieTheater(theaterCode: string): IPlaceOperation<void>;
/**
 * 劇場検索
 */
export declare function searchMovieTheaters(searchConditions: {}): IPlaceOperation<factory.place.movieTheater.IPlaceWithoutScreeningRoom[]>;
/**
 * 枝番号で劇場検索
 */
export declare function findMovieTheaterByBranchCode(branchCode: string): IPlaceOperation<factory.place.movieTheater.IPlace>;
