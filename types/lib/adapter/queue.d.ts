/// <reference types="mongoose" />
/**
 * キューアダプター
 *
 * @class QueueAdapter
 */
import { Connection } from 'mongoose';
import queueModel from './mongoose/model/queue';
export default class QueueAdapter {
    readonly connection: Connection;
    model: typeof queueModel;
    constructor(connection: Connection);
}
