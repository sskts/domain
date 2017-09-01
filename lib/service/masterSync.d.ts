import CreativeWorkRepository from '../repo/creativeWork';
import EventRepository from '../repo/event';
import PlaceRepository from '../repo/place';
export declare type IPlaceOperation<T> = (placeRepository: PlaceRepository) => Promise<T>;
/**
 * 映画作品インポート
 */
export declare function importMovies(theaterCode: string): (creativeWorkRepository: CreativeWorkRepository) => Promise<void>;
/**
 * import screening events from COA
 * COAから上映イベントをインポートする
 * @export
 * @function
 * @memberof service/event
 */
export declare function importScreeningEvents(theaterCode: string, importFrom: Date, importThrough: Date): (eventRepository: EventRepository, placeRepository: PlaceRepository) => Promise<void>;
/**
 * 劇場インポート
 */
export declare function importMovieTheater(theaterCode: string): IPlaceOperation<void>;
