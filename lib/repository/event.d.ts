/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import eventModel from './mongoose/model/event';
/**
 * イベントレポジトリー
 *
 * @class EventRepository
 */
export default class EventRepository {
    readonly eventModel: typeof eventModel;
    constructor(connection: Connection);
}
