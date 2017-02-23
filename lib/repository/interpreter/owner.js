/**
 * 所有者リポジトリ
 *
 * @class OwnerRepositoryInterpreter
 */
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
const owner_1 = require("../../model/owner");
const ownerGroup_1 = require("../../model/ownerGroup");
const owner_2 = require("./mongoose/model/owner");
class OwnerRepositoryInterpreter {
    constructor(connection) {
        this.connection = connection;
    }
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(owner_2.default.modelName);
            return yield model.find({ $and: [conditions] }).lean().exec();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(owner_2.default.modelName);
            const doc = yield model.findById(id).exec();
            return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
        });
    }
    findPromoter() {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(owner_2.default.modelName);
            const doc = yield model.findOne({ group: ownerGroup_1.default.PROMOTER }).exec();
            return (doc) ? monapt.Option(owner_1.default.createPromoter(doc.toObject())) : monapt.None;
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(owner_2.default.modelName);
            const doc = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).exec();
            return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
        });
    }
    store(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(owner_2.default.modelName);
            yield model.findByIdAndUpdate(owner.id, owner, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OwnerRepositoryInterpreter;
