"use strict";
/**
 * mockgoose test
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mockgoose_1 = require("mockgoose");
const mongoose = require("mongoose");
const sskts = require("../lib/index");
let mockgoose;
before(() => __awaiter(this, void 0, void 0, function* () {
    mockgoose = new mockgoose_1.Mockgoose(mongoose);
    // await mockgoose.prepareStorage();
    mongoose.connect(process.env.MONGOLAB_URI);
    // mongoose.connection.on('connected', () => {
    //     console.log('db connection is now open');
    // });
}));
describe('...', () => {
    it('...', () => __awaiter(this, void 0, void 0, function* () {
        // ...
        const eventAdapter = sskts.repository.event(mongoose.connection);
        const event = yield eventAdapter.eventModel.findOne({
            identifier: '11899100020170904102025'
        }).exec();
        console.log('event:', event);
    }));
});
