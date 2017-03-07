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
Object.defineProperty(exports, "__esModule", { value: true });
const clone = require("clone");
const monapt = require("monapt");
const ownerGroup_1 = require("../../model/ownerGroup");
const owner_1 = require("./mongoose/model/owner");
class OwnerRepositoryInterpreter {
    constructor(connection) {
        this.connection = connection;
        this.model = this.connection.model(owner_1.default.modelName);
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model.findById(id).exec();
            return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
        });
    }
    findPromoter() {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model.findOne({ group: ownerGroup_1.default.PROMOTER }).exec();
            return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).exec();
            return (doc) ? monapt.Option(doc.toObject()) : monapt.None;
        });
    }
    store(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = clone(owner, false);
            yield this.model.findByIdAndUpdate(update.id, update, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
exports.default = OwnerRepositoryInterpreter;
