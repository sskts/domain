/**
 * ショップサービス
 *
 * @namespace service/shop
 */
import * as TheaterFactory from '../factory/theater';
import TheaterAdapter from '../adapter/theater';
export declare type ITheaterOperation<T> = (adapter: TheaterAdapter) => Promise<T>;
export declare function open(theater: TheaterFactory.ITheater): ITheaterOperation<void>;
