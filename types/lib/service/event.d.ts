import * as monapt from 'monapt';
import * as IndividualScreeningEventFactory from '../factory/event/individualScreeningEvent';
import EventAdapter from '../adapter/event';
import PlaceAdapter from '../adapter/place';
export interface ISearchPerformancesConditions {
    day?: string;
    theater?: string;
}
/**
 * 上映イベントインポート
 */
export declare function importScreeningEvents(theaterCode: string, importFrom: Date, importThrough: Date): (eventAdapter: EventAdapter, placeAdapter: PlaceAdapter) => Promise<void>;
/**
 * 上映イベント検索
 * 空席状況情報がなかったバージョンに対して互換性を保つために
 * performanceStockStatusAdapterはundefinedでも使えるようになっている
 */
export declare function searchIndividualScreeningEvents(searchConditions: ISearchPerformancesConditions): (eventAdapter: EventAdapter) => Promise<IndividualScreeningEventFactory.IEvent[]>;
/**
 * IDで上映イベント検索
 */
export declare function findIndividualScreeningEventByIdentifier(identifier: string): (eventAdapter: EventAdapter) => Promise<monapt.Option<IndividualScreeningEventFactory.IEvent>>;
