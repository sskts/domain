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
const ownerGroup_1 = require("../../model/ownerGroup");
const owner_1 = require("./mongoose/model/owner");
class OwnerRepositoryInterpreter {
    constructor(connection) {
        this.connection = connection;
    }
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(owner_1.default.modelName, owner_1.default.schema);
            return yield model.find({ $and: [conditions] }).lean().exec();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(owner_1.default.modelName, owner_1.default.schema);
            const owner = yield model.findOne({ _id: id }).lean().exec();
            return (owner) ? monapt.Option(owner) : monapt.None;
        });
    }
    findPromoter() {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(owner_1.default.modelName, owner_1.default.schema);
            const owner = yield model.findOne({ group: ownerGroup_1.default.PROMOTER }).lean().exec();
            return (owner) ? monapt.Option(owner) : monapt.None;
        });
    }
    findOneAndUpdate(conditions, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(owner_1.default.modelName, owner_1.default.schema);
            const owner = yield model.findOneAndUpdate(conditions, update, {
                new: true,
                upsert: false
            }).lean().exec();
            return (owner) ? monapt.Option(owner) : monapt.None;
        });
    }
    store(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(owner_1.default.modelName, owner_1.default.schema);
            yield model.findOneAndUpdate({ _id: owner._id }, owner, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OwnerRepositoryInterpreter;
