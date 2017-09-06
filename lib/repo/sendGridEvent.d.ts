/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import SendGridEventModel from './mongoose/model/sendGridEvent';
/**
 * SendGridイベントレポジトリー
 *
 * @class SendGridEventRepository
 */
export declare class MongoRepository {
    readonly sendGridEventModel: typeof SendGridEventModel;
    constructor(connection: Connection);
}
