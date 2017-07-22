/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import eventModel from './mongoose/model/event';
/**
 * イベントアダプター
 *
 * @class EventAdapter
 */
export default class EventAdapter {
    readonly eventModel: typeof eventModel;
    constructor(connection: Connection);
}
