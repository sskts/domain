/// <reference types="mongoose" />
/**
 * キューリポジトリ
 *
 * @class QueueAdapter
 */
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Authorization from '../factory/authorization';
import * as Notification from '../factory/notification';
import * as Queue from '../factory/queue';
import queueModel from './mongoose/model/queue';
export default class QueueAdapter {
    readonly connection: Connection;
    model: typeof queueModel;
    constructor(connection: Connection);
    findOneSendEmailAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.IPushNotificationQueue<Notification.IEmailNotification>>>;
    findOneSettleGMOAuthorizationAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.ISettleAuthorizationQueue<Authorization.IGMOAuthorization>>>;
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.ISettleAuthorizationQueue<Authorization.ICOASeatReservationAuthorization>>>;
    findOneCancelGMOAuthorizationAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.ICancelAuthorizationQueue<Authorization.IGMOAuthorization>>>;
    findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.ICancelAuthorizationQueue<Authorization.ICOASeatReservationAuthorization>>>;
    findOneDisableTransactionInquiryAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.IDisableTransactionInquiryQueue>>;
}
