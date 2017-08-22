import * as factory from '@motionpicture/sskts-factory';
import * as monapt from 'monapt';
import EventAdapter from '../adapter/event';
import PlaceAdapter from '../adapter/place';
export interface ISearchPerformancesConditions {
    day?: string;
    theater?: string;
}
export declare type IEventOperation<T> = (eventAdapter: EventAdapter) => Promise<T>;
/**
 * 上映イベントインポート
 */
export declare function importScreeningEvents(theaterCode: string, importFrom: Date, importThrough: Date): (eventAdapter: EventAdapter, placeAdapter: PlaceAdapter) => Promise<void>;
/**
 * 上映イベント検索
 * 空席状況情報がなかったバージョンに対して互換性を保つために
 * performanceStockStatusAdapterはundefinedでも使えるようになっている
 */
export declare function searchIndividualScreeningEvents(searchConditions: ISearchPerformancesConditions): IEventOperation<factory.event.individualScreeningEvent.IEvent[]>;
/**
 * IDで上映イベント検索
 */
export declare function findIndividualScreeningEventByIdentifier(identifier: string): IEventOperation<monapt.Option<factory.event.individualScreeningEvent.IEvent>>;
