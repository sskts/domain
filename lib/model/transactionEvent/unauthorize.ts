// tslint:disable:variable-name
import Authorization from '../authorization';
import ObjectId from '../objectId';
import TransactionEvent from '../transactionEvent';
import TransactionEventGroup from '../transactionEventGroup';

/**
 * オーソリ削除取引イベント
 *
 *
 * @class Unauthorize
 * @extends {TransactionEvent}
 * @param {ObjectId} _id
 * @param {ObjectId} transaction 取引ID
 * @param {Date} occurred_at
 * @param {Authorization} authorization
 */
export default class Unauthorize extends TransactionEvent {
    constructor(
        readonly _id: ObjectId,
        readonly transaction: ObjectId,
        readonly occurred_at: Date,
        readonly authorization: Authorization
    ) {
        super(_id, transaction, TransactionEventGroup.UNAUTHORIZE, occurred_at);

        // todo validation
    }
}
