/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import SendGridEventModel from './mongoose/model/sendGridEvent';
/**
 * SendGridイベントレポジトリー
 *
 * @class SendGridEventRepository
 */
export default class SendGridEventRepository {
    readonly sendGridEventModel: typeof SendGridEventModel;
    constructor(connection: Connection);
}
