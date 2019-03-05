/**
 * 会員プログラム作成サンプル
 * @ignore
 */
const sskts = require('../');

async function main() {
    await sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const repo = new sskts.repository.ProgramMembership(sskts.mongoose.connection);
    await repo.programMembershipModel.create({
        typeOf: 'ProgramMembership',
        programName: '[development]会員ポイントプログラム',
        award: ['PecorinoPayment'],
        offers: [],
    });

    await sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
