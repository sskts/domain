/**
 * MongoDBに接続するサンプル
 *
 * @ignore
 */

// tslint:disable:no-console

import * as sskts from '../lib/index';

async function main() {
    const connection = sskts.mongoose.createConnection(<string>process.env.MONGOLAB_URI);
    console.log('databaseName is', connection.db.databaseName);

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
