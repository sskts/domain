"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// tslint:disable-next-line:missing-jsdoc
const mongoose = require("mongoose");
const SSKTS = require("../../lib/index");
let connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});
describe('transaction service', () => {
    it('export queues', () => __awaiter(this, void 0, void 0, function* () {
        yield SSKTS.TransactionService.exportQueues('58ab949eedc005093c5fe3c6')(SSKTS.createTransactionRepository(connection), SSKTS.createQueueRepository(connection));
    }));
});
