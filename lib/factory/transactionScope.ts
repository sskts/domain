/**
 * 取引スコープファクトリー
 *
 * @namespace factory/transactionScope
 */

import * as moment from 'moment';
import * as _ from 'underscore';

import ArgumentError from '../error/argument';

export interface ITransactionScope {
    /**
     * いつから開始準備状態か
     *
     * @type {Date}
     * @memberof ITransactionScope
     */
    readyFrom: Date;
    /**
     * いつまで開始準備状態か
     *
     * @type {Date}
     * @memberof ITransactionScope
     */
    readyThrough: Date;
    /**
     * どのクライアントでやりとりされるアクションなのか
     *
     * @type {string}
     * @memberof ITransactionScope
     */
    client?: string;
    /**
     * どの劇場におけるアクションなのか
     *
     * @type {string}
     * @memberof ITransactionScope
     */
    theater?: string;
}

export function create(args: {
    readyFrom: Date;
    readyThrough: Date;
    client?: string;
    theater?: string;
}): ITransactionScope {
    if (!_.isDate(args.readyFrom)) throw new ArgumentError('readyFrom', 'readyFrom should be Date');
    if (!_.isDate(args.readyThrough)) throw new ArgumentError('readyThrough', 'readyThrough should be Date');

    // untilはfromより遅くなければならない
    if (args.readyThrough.getTime() <= args.readyFrom.getTime()) {
        throw new ArgumentError('readyThrough', 'readyThrough must be later than readyFrom');
    }

    return {
        readyFrom: args.readyFrom,
        readyThrough: args.readyThrough,
        client: args.client,
        theater: args.theater
    };
}

/**
 * スコープを文字列に変換する
 *
 * @param {ITransactionScope} scope アクションスコープ
 */
export function scope2String(scope: ITransactionScope) {
    let scopeStr = 'transactionScope';
    scopeStr += `:readyFrom:${moment(scope.readyFrom).unix()}`;
    scopeStr += `:readyThrough:${moment(scope.readyThrough).unix()}`;

    if (scope.client !== undefined) {
        scopeStr += `:client:${scope.client}`;
    }
    if (scope.theater !== undefined) {
        scopeStr += `:theater:${scope.theater}`;
    }

    return scopeStr;
}
