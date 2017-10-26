/**
 * タスク名でタスクを実行するサンプル
 * @ignore
 */

const sskts = require('../');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    await sskts.service.task.executeByName(sskts.factory.taskName.SettleMvtk)(
        new sskts.repository.Task(sskts.mongoose.connection),
        sskts.mongoose.connection
    );

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
