/**
 * オーソリ追加取引イベントファクトリー
 *
 * @namespace factory/transactionEvent/authorize
 */

import * as _ from 'underscore';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

import * as ActionEventFactory from '../actionEvent';
import ActionEventType from '../actionEventType';
import * as Authorization from '../authorization';
import ObjectId from '../objectId';

/**
 * オーソリ追加取引イベント
 *
 * @interface TransactionEvent
 * @extends {TransactionEvent}
 * @param {Authorization} authorization
 * @memberof tobereplaced$
 */
export interface IActionEvent extends ActionEventFactory.IActionEvent {
    authorization: Authorization.IAuthorization;
}

/**
 *
 * @memberof tobereplaced$
 */
export function create(args: {
    id?: string,
    occurredAt: Date,
    authorization: Authorization.IAuthorization
}): IActionEvent {
    if (_.isEmpty(args.authorization)) throw new ArgumentNullError('authorization');
    if (!_.isDate(args.occurredAt)) throw new ArgumentError('occurredAt', 'occurredAt should be Date');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        actionEventType: ActionEventType.Authorize,
        occurredAt: args.occurredAt,
        authorization: args.authorization
    };
}
