/**
 * 資産リポジトリ
 *
 * @class AssetAdapterInterpreter
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
const asset_1 = require("./mongoose/model/asset");
class AssetAdapterInterpreter {
    constructor(connection) {
        this.connection = connection;
        this.model = this.connection.model(asset_1.default.modelName);
    }
    store(asset) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = clone(asset, false);
            yield this.model.findByIdAndUpdate(update.id, update, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
exports.default = AssetAdapterInterpreter;