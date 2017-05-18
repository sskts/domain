"use strict";
/**
 * マスターサービステスト
 *
 * @ignore
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
const assert = require("assert");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const client_1 = require("../../lib/adapter/client");
const clientService = require("../../lib/service/client");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全て削除してからテスト開始
    const clientAdapter = new client_1.default(connection);
    yield clientAdapter.clientModel.remove({}).exec();
    yield clientAdapter.clientEventModel.remove({}).exec();
}));
describe('クライアントサービス 作成', () => {
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        const clientAdapter = new client_1.default(connection);
        const args = {
            id: 'motionpicture',
            secret: 'motionpicture',
            name: {
                en: 'motionpicture',
                ja: 'モーションピクチャー'
            },
            description: {
                en: 'motionpicture',
                ja: 'モーションピクチャー'
            },
            notes: {
                en: 'motionpicture',
                ja: 'モーションピクチャー'
            },
            email: 'hello@motionpicture,jp'
        };
        yield clientService.create(args)(clientAdapter);
        // DBに存在することを確認
        const clientDoc = yield clientAdapter.clientModel.findById(args.id).exec();
        assert(clientDoc !== null);
        // パスワードが正しいことを確認
        const isValid = yield bcrypt.compare(args.secret, clientDoc.get('secret_hash'));
        assert(isValid);
        // テストデータ削除
        yield clientAdapter.clientModel.findByIdAndRemove(args.id).exec();
    }));
});
describe('クライアントイベントサービス 作成', () => {
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        const clientAdapter = new client_1.default(connection);
        const createArgs = {
            id: 'motionpicture',
            secret: 'motionpicture',
            name: {
                en: 'motionpicture',
                ja: 'モーションピクチャー'
            },
            description: {
                en: 'motionpicture',
                ja: 'モーションピクチャー'
            },
            notes: {
                en: 'motionpicture',
                ja: 'モーションピクチャー'
            },
            email: 'hello@motionpicture,jp'
        };
        yield clientService.create(createArgs)(clientAdapter);
        const occurredAt = new Date();
        const label = `test-label${occurredAt.valueOf().toString()}`;
        const pushEventArgs = {
            client: 'motionpicture',
            occurred_at: new Date(),
            label: label
        };
        yield clientService.pushEvent(pushEventArgs)(clientAdapter);
        // DBに存在することを確認
        const clientEventDoc = yield clientAdapter.clientEventModel.findOne({
            client: createArgs.id
        }).sort({ updated_at: -1 }).exec();
        assert(clientEventDoc !== null);
        // ラベル確認
        assert.equal(clientEventDoc.get('label'), label);
        // テストデータ削除
        yield clientAdapter.clientModel.findByIdAndRemove(createArgs.id).exec();
        yield clientAdapter.clientEventModel.findByIdAndRemove(clientEventDoc.get('id')).exec();
    }));
});
