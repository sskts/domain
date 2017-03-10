import * as monapt from 'monapt';
import * as Authorization from '../factory/authorization';
import * as Notification from '../factory/notification';
import * as Queue from '../factory/queue';

/**
 * キューリポジトリ
 *
 * @interface QueueAdapter
 */
interface IQueueAdapter {
    /**
     * ひとつ検索&更新
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.IQueue>>;
    /**
     * メール送信キューをひとつ検索
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneSendEmailAndUpdate(conditions: any, update: any):
        Promise<monapt.Option<Queue.IPushNotificationQueue<Notification.IEmailNotification>>>;
    /**
     * GMOオーソリ実売上キューをひとつ検索
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneSettleGMOAuthorizationAndUpdate(conditions: any, update: any):
        Promise<monapt.Option<Queue.ISettleAuthorizationQueue<Authorization.IGMOAuthorization>>>;
    /**
     * GMOオーソリ取消キューをひとつ検索
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneCancelGMOAuthorizationAndUpdate(conditions: any, update: any):
        Promise<monapt.Option<Queue.ICancelAuthorizationQueue<Authorization.IGMOAuthorization>>>;
    /**
     * COA座席本予約キューをひとつ検索
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: any, update: any):
        Promise<monapt.Option<Queue.ISettleAuthorizationQueue<Authorization.ICOASeatReservationAuthorization>>>;
    /**
     * COA座席仮予約削除キューをひとつ検索
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions: any, update: any):
        Promise<monapt.Option<Queue.ICancelAuthorizationQueue<Authorization.ICOASeatReservationAuthorization>>>;
    /**
     * 保管する
     *
     * @param {Queue} queue
     */
    store(queue: Queue.IQueue): Promise<void>;
}

export default IQueueAdapter;
