/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import SendGridEventModel from './mongoose/model/sendGridEvent';
/**
 * SendGridイベントアダプター
 *
 * @export
 * @class SendGridEventAdapter
 */
export default class SendGridEventAdapter {
    readonly sendGridEventModel: typeof SendGridEventModel;
    constructor(connection: Connection);
}
