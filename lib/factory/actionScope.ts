/**
 * アクションスコープファクトリー
 *
 * @namespace factory/actionScope
 */

import * as moment from 'moment';
import * as _ from 'underscore';

import ArgumentError from '../error/argument';

export interface IActionScope {
    /**
     * いつから開始準備状態か
     *
     * @type {Date}
     * @memberof IActionScope
     */
    ready_from: Date;
    /**
     * いつまで開始準備状態か
     *
     * @type {Date}
     * @memberof IActionScope
     */
    ready_until: Date;
    /**
     * どのクライアントでやりとりされるアクションなのか
     *
     * @type {string}
     * @memberof IActionScope
     */
    client?: string;
    /**
     * どの劇場におけるアクションなのか
     *
     * @type {string}
     * @memberof IActionScope
     */
    theater?: string;
}

export function create(args: {
    ready_from: Date;
    ready_until: Date;
    client?: string;
    theater?: string;
}): IActionScope {
    if (!_.isDate(args.ready_from)) throw new ArgumentError('ready_from', 'ready_from should be Date');
    if (!_.isDate(args.ready_until)) throw new ArgumentError('ready_until', 'ready_until should be Date');

    // untilはfromより遅くなければならない
    if (args.ready_until.getTime() <= args.ready_from.getTime()) {
        throw new ArgumentError('ready_until', 'ready_until must be later than ready_from');
    }

    return {
        ready_from: args.ready_from,
        ready_until: args.ready_until,
        client: args.client,
        theater: args.theater
    };
}

/**
 * スコープを文字列に変換する
 *
 * @param {IActionScope} scope アクションスコープ
 */
export function scope2String(scope: IActionScope) {
    let scopeStr = 'actionScope';
    scopeStr += `:ready_from:${moment(scope.ready_from).unix()}`;
    scopeStr += `:ready_until:${moment(scope.ready_until).unix()}`;

    if (scope.client !== undefined) {
        scopeStr += `:client:${scope.client}`;
    }
    if (scope.theater !== undefined) {
        scopeStr += `:theater:${scope.theater}`;
    }

    return scopeStr;
}
