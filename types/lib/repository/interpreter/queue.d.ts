/// <reference types="mongoose" />
/**
 * キューリポジトリ
 *
 * @class QueueRepositoryInterpreter
 */
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import QueueRepository from '../queue';
import Authorization from '../../model/authorization';
import Notification from '../../model/notification';
import Queue from '../../model/queue';
export default class QueueRepositoryInterpreter implements QueueRepository {
    readonly connection: Connection;
    private model;
    constructor(connection: Connection);
    findOneAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue>>;
    findOneSendEmailAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.PushNotificationQueue<Notification.EmailNotification>>>;
    findOneSettleGMOAuthorizationAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.SettleAuthorizationQueue<Authorization.GMOAuthorization>>>;
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.SettleAuthorizationQueue<Authorization.COASeatReservationAuthorization>>>;
    findOneCancelGMOAuthorizationAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.CancelAuthorizationQueue<Authorization.GMOAuthorization>>>;
    findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.CancelAuthorizationQueue<Authorization.COASeatReservationAuthorization>>>;
    findOneDisableTransactionInquiryAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.DisableTransactionInquiryQueue>>;
    store(queue: Queue): Promise<void>;
}
