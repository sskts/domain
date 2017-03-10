"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:missing-jsdoc
const mongoose = require("mongoose");
// import * as sskts from '../../lib/index';
let connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});
describe('transaction service', () => {
    // it('export queues', async () => {
    //     await sskts.service.transaction.exportQueues('58ab949eedc005093c5fe3c6')(
    //         sskts.createTransactionAdapter(connection),
    //         sskts.createQueueAdapter(connection)
    //     );
    // });
});
