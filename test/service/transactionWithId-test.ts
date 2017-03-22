/**
 * 取引(ID指定)サービステスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as clone from 'clone';
import * as mongoose from 'mongoose';
import * as sskts from '../../lib/index';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const transactionAdapter = sskts.adapter.transaction(connection);
    await transactionAdapter.transactionModel.remove({}).exec();
    await transactionAdapter.transactionEventModel.remove({}).exec();
});

describe('transactionWithId service', () => {
    // todo テストコードをかく

    it('addMvtkAuthorization ok.', async () => {
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);

        // test data
        const owner1 = sskts.factory.owner.anonymous.create({});
        const owner2 = sskts.factory.owner.anonymous.create({});

        const transaction = sskts.factory.transaction.create({
            status: sskts.factory.transactionStatus.UNDERWAY,
            owners: [owner1, owner2],
            expires_at: new Date()
        });

        const authorization = sskts.factory.authorization.mvtk.create({
            price: 1234,
            owner_from: owner1.id,
            owner_to: owner2.id,
            kgygish_cd: '000000',
            yyk_dvc_typ: '00',
            trksh_flg: '0',
            kgygish_sstm_zskyyk_no: 'xxx',
            kgygish_usr_zskyyk_no: 'xxx',
            jei_dt: '2012/02/01 25:45:00',
            kij_ymd: '2012/02/01',
            st_cd: '0000000000',
            scren_cd: '0000000000',
            knyknr_no_info: [],
            zsk_info: [],
            skhn_cd: '0000000000'
        });

        await ownerAdapter.model.findByIdAndUpdate(owner1.id, owner1, { new: true, upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(owner2.id, owner2, { new: true, upsert: true }).exec();
        const update = Object.assign(clone(transaction), { owners: [owner1.id, owner2.id] });
        await transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();

        await sskts.service.transactionWithId.addMvtkAuthorization(transaction.id, authorization)(transactionAdapter);

        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = await transactionAdapter.transactionEventModel.findOne(
            {
                'authorization.id': authorization.id
            }
        ).exec();
        assert.equal(transactionEvent.get('transaction'), transaction.id);

        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(owner1.id).exec();
        await ownerAdapter.model.findByIdAndRemove(owner2.id).exec();
    });
});
