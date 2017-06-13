"use strict";
/**
 * クライアントイベントファクトリーテスト
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const ClientEventFactory = require("../../lib/factory/clientEvent");
let TEST_CREATE_CLIENT_EVENT_ARGS;
before(() => {
    TEST_CREATE_CLIENT_EVENT_ARGS = {
        client: 'xxx',
        occurred_at: new Date(),
        label: 'xxx'
    };
});
describe('クライアントイベントファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            ClientEventFactory.create(TEST_CREATE_CLIENT_EVENT_ARGS);
        });
    });
    it('引数に取引がフィールドがあれば結果にも存在する', () => {
        assert.doesNotThrow(() => {
            const args = Object.assign({}, TEST_CREATE_CLIENT_EVENT_ARGS, { transaction: 'xxx' });
            const event = ClientEventFactory.create(args);
            assert(event.transaction !== undefined);
        });
    });
});
