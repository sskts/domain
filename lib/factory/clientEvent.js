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
const objectId_1 = require("./objectId");
function create(args) {
    // todo validation
    const event = {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        client: args.client,
        occurredAt: args.occurredAt,
        url: (args.url !== undefined) ? args.url : '',
        label: args.label,
        category: (args.category !== undefined) ? args.category : '',
        action: (args.action !== undefined) ? args.action : '',
        message: (args.message !== undefined) ? args.message : '',
        notes: (args.notes !== undefined) ? args.notes : '',
        useragent: (args.useragent !== undefined) ? args.useragent : '',
        location: (args.location !== undefined) ? args.location : []
    };
    if (args.transaction !== undefined) {
        event.transaction = args.transaction;
    }
    return event;
}
exports.create = create;
