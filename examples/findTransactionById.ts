/* tslint:disable */
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const adapter = sskts.adapter.transaction(connection);
        const transactionDoc = await adapter.transactionModel.findById('58eea4d071358c1bbc062718').exec();
        console.log(transactionDoc);
        const expiredAt = <Date>transactionDoc.get('expired_at');
        console.log(expiredAt);
        console.log(expiredAt instanceof Date);
        console.log(expiredAt.getFullYear());
    } catch (error) {
        console.error(error);
    }
    console.log('disconnecting...');
    mongoose.disconnect();
}

main();
