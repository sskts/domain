"use strict";
/**
 * アプリケーションクライアントサービス
 *
 * @namespace service/client
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
const createDebug = require("debug");
const argument_1 = require("../error/argument");
const clientFactory = require("../factory/client");
const clientEventFactory = require("../factory/clientEvent");
const debug = createDebug('sskts-domain:service:client');
/**
 * クライアントを更新する
 *
 * @param {clientFactory.IClient} args クライアントインターフェース
 * @returns {ClientOperation<void>} クライアントアダプターを使った操作
 */
function create(args) {
    return (clientAdapter) => __awaiter(this, void 0, void 0, function* () {
        // シークレットをハッシュ化
        const SALT_LENGTH = 8;
        const hash = yield bcrypt.hash(args.secret, SALT_LENGTH);
        const client = clientFactory.create({
            id: args.id,
            secret_hash: hash,
            name: args.name,
            description: args.description,
            notes: args.notes,
            email: args.email
        });
        debug('creating a client...', client);
        // ドキュメント作成(idが既に存在していればユニーク制約ではじかれる)
        yield clientAdapter.clientModel.findByIdAndUpdate(client.id, client, { upsert: true }).exec();
    });
}
exports.create = create;
function pushEvent(args) {
    return (clientAdapter) => __awaiter(this, void 0, void 0, function* () {
        // クライアントの存在確認
        const clientDoc = yield clientAdapter.clientModel.findById(args.client, '_id').exec();
        if (clientDoc === null) {
            throw new argument_1.default('client', `client[${args.client}] not found.`);
        }
        // イベント作成
        const clientEvent = clientEventFactory.create(args);
        debug('creating a clientEvent...', clientEvent);
        // ドキュメント作成(idが既に存在していればユニーク制約ではじかれる)
        yield clientAdapter.clientEventModel.create(args);
    });
}
exports.pushEvent = pushEvent;
