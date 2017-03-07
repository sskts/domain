import * as monapt from 'monapt';
import * as Authorization from '../model/authorization';
import * as Notification from '../model/notification';
import * as Transaction from '../model/transaction';
import * as TransactionEvent from '../model/transactionEvent';

/**
 * 取引リポジトリ
 *
 * @interface TransactionRepository
 */
interface ITransactionRepository {
    /**
     * 検索
     *
     * @param {Object} conditions 検索条件
     */
    find(conditions: any): Promise<Transaction.ITransaction[]>;
    /**
     * ID検索
     *
     * @param {string} id
     */
    findById(id: string): Promise<monapt.Option<Transaction.ITransaction>>;
    /**
     * ひとつ検索
     *
     * @param {Object} conditions 検索条件
     */
    findOne(conditions: any): Promise<monapt.Option<Transaction.ITransaction>>;
    /**
     * ひとつ検索&更新
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneAndUpdate(conditions: any, update: any): Promise<monapt.Option<Transaction.ITransaction>>;
    /**
     * 保管する
     *
     * @param {Transaction} transaction 取引
     */
    store(transaction: Transaction.ITransaction): Promise<void>;
    /**
     * イベント追加する
     *
     * @param {TransactionEvent} transactionEvent 取引イベント
     */
    addEvent(transactionEvent: TransactionEvent.ITransactionEvent): Promise<void>;
    /**
     * 取引IDから承認リストを取得する
     *
     * @param {string} id 取引ID
     */
    findAuthorizationsById(id: string): Promise<Authorization.IAuthorization[]>;
    /**
     * 取引IDから通知リストを取得する
     *
     * @param {string} id 取引ID
     */
    findNotificationsById(id: string): Promise<Notification.INotification[]>;
    /**
     * 成立可能かどうか
     *
     * @returns {Promies<boolean>}
     */
    canBeClosed(id: string): Promise<boolean>;
}

export default ITransactionRepository;
