/**
 * 資産リポジトリ
 *
 * @class AssetRepositoryInterpreter
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
const asset_1 = require("./mongoose/model/asset");
class AssetRepositoryInterpreter {
    constructor(connection) {
        this.connection = connection;
    }
    store(asset) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(asset_1.default.modelName);
            yield model.findOneAndUpdate({ _id: asset.id }, asset, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AssetRepositoryInterpreter;
