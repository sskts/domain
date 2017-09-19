"use strict";
/**
 * アプリケーションクライアントファクトリー
 * チケッティングweb、スマホアプリなど、ssktsのapiを使用するアプリケーションクライアントを生成する
 *
 * @namespace factory/client
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * クライアントを生成する
 *
 * @returns {IClient} クライアントオブジェクト
 *
 * @memberof factory/client
 */
function create(args) {
    // todo validation
    return {
        id: args.id,
        secret_hash: args.secret_hash,
        name: args.name,
        description: args.description,
        notes: args.notes,
        email: args.email
    };
}
exports.create = create;
