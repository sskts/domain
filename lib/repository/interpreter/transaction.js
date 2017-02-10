"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const monapt = require("monapt");
const transaction_1 = require("../../factory/transaction");
const transaction_2 = require("./mongoose/model/transaction");
class TransactionRepositoryInterpreter {
    constructor(connection) {
        this.connection = connection;
    }
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName, transaction_2.default.schema);
            const docs = yield model.find()
                .where(conditions)
                .populate("owner")
                .lean()
                .exec();
            return docs.map(transaction_1.default.create);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName, transaction_2.default.schema);
            const doc = yield model.findOne()
                .where("_id").equals(id)
                .populate("owners").lean().exec();
            return (doc) ? monapt.Option(transaction_1.default.create(doc)) : monapt.None;
        });
    }
    findOne(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName, transaction_2.default.schema);
            const doc = yield model.findOne(conditions).lean().exec();
            return (doc) ? monapt.Option(transaction_1.default.create(doc)) : monapt.None;
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName, transaction_2.default.schema);
            const doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false,
            }).lean().exec();
            return (doc) ? monapt.Option(transaction_1.default.create(doc)) : monapt.None;
        });
    }
    store(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(transaction_2.default.modelName, transaction_2.default.schema);
            yield model.findOneAndUpdate({ _id: transaction._id }, transaction, {
                new: true,
                upsert: true,
            }).lean().exec();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionRepositoryInterpreter;
