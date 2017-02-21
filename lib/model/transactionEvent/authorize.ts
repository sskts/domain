// tslint:disable:variable-name
import Authorization from '../authorization';
import ObjectId from '../objectId';
import TransactionEvent from '../transactionEvent';
import TransactionEventGroup from '../transactionEventGroup';

/**
 * オーソリ追加取引イベント
 *
 * @class AuthorizeTransactionEvent
 * @extends {TransactionEvent}
 * @param {ObjectId} _id
 * @param {ObjectId} transaction 取引ID
 * @param {Date} occurred_at
 * @param {Authorization} authorization
 */
export default class AuthorizeTransactionEvent extends TransactionEvent {
    constructor(
        readonly _id: ObjectId,
        readonly transaction: ObjectId,
        readonly occurred_at: Date,
        readonly authorization: Authorization
    ) {
        super(_id, transaction, TransactionEventGroup.AUTHORIZE, occurred_at);

        // todo validation
    }
}
