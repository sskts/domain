"use strict";
/**
 * アプリケーションクライアントイベントファクトリー
 * クライアントサイドで発生したイベントを生成する
 * クライアントサイドからapiを通じて生成される想定
 *
 * todo jsdoc整備(一通り実装してからやる)
 *
 * @namespace factory/clientEvent
 */
Object.defineProperty(exports, "__esModule", { value: true });
function create(args) {
    // todo validation
    return {
        client: args.client,
        occurred_at: args.occurred_at,
        url: args.url,
        label: args.label,
        category: args.category,
        action: args.action,
        message: args.message,
        notes: args.notes,
        useragent: args.useragent,
        location: args.location,
        transaction: args.transaction
    };
}
exports.create = create;
