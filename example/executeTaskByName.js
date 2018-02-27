/**
 * タスク名でタスクを実行するサンプル
 * @ignore
 */

const sskts = require('../');

async function main() {
    await sskts.mongoose.connect(process.env.MONGOLAB_URI);

    await sskts.service.task.executeByName(sskts.factory.taskName.UseMvtk)({
        taskRepo: new sskts.repository.Task(sskts.mongoose.connection),
        connection: sskts.mongoose.connection
    });

    await sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
