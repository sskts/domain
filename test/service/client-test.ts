/**
 * マスターサービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as bcrypt from 'bcryptjs';
import * as mongoose from 'mongoose';

import ClientAdapter from '../../lib/adapter/client';
import * as clientService from '../../lib/service/client';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const clientAdapter = new ClientAdapter(connection);
    await clientAdapter.clientModel.remove({}).exec();
    await clientAdapter.clientEventModel.remove({}).exec();
});

describe('クライアントサービス 作成', () => {
    it('成功', async () => {
        const clientAdapter = new ClientAdapter(connection);
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
        await clientService.create(args)(clientAdapter);

        // DBに存在することを確認
        const clientDoc = await clientAdapter.clientModel.findById(args.id).exec();
        assert(clientDoc !== null);

        // パスワードが正しいことを確認
        const isValid = await bcrypt.compare(args.secret, clientDoc.get('secret_hash'));
        assert(isValid);

        // テストデータ削除
        await clientAdapter.clientModel.findByIdAndRemove(args.id).exec();
    });
});

describe('クライアントイベントサービス 作成', () => {
    it('成功', async () => {
        const clientAdapter = new ClientAdapter(connection);
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
        await clientService.create(createArgs)(clientAdapter);

        const occurredAt = new Date();
        const label = `test-label${occurredAt.valueOf().toString()}`;
        const pushEventArgs = {
            client: 'motionpicture',
            occurred_at: new Date(),
            label: label
        };
        const clientEvent = await clientService.pushEvent(pushEventArgs)(clientAdapter);

        // DBに存在することを確認
        const clientEventDoc = await clientAdapter.clientEventModel.findById(clientEvent.id).exec();
        assert(clientEventDoc !== null);

        // ラベル確認
        assert.equal(clientEventDoc.get('label'), label);

        // テストデータ削除
        await clientAdapter.clientModel.findByIdAndRemove(createArgs.id).exec();
        await clientAdapter.clientEventModel.findByIdAndRemove(clientEvent.id).exec();
    });
});
