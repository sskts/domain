import * as monapt from 'monapt';
import * as IndividualScreeningEventFactory from '../factory/event/individualScreeningEvent';
import IMultilingualString from '../factory/multilingualString';
import * as PerformanceStockStatusFactory from '../factory/stockStatus/performance';
import EventAdapter from '../adapter/event';
import PlaceAdapter from '../adapter/place';
export interface ISearchPerformancesConditions {
    day?: string;
    theater?: string;
}
export interface ISearchPerformancesResult {
    id: string;
    theater: {
        id: string;
        name: IMultilingualString;
    };
    screen: {
        id: string;
        name: IMultilingualString;
    };
    film: {
        id: string;
        name: IMultilingualString;
        minutes: number;
    };
    day: string;
    time_start: string;
    time_end: string;
    canceled: boolean;
    stock_status: PerformanceStockStatusFactory.Expression | null;
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
