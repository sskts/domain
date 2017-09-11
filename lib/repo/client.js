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
const clientEvent_1 = require("./mongoose/model/clientEvent");
/**
 * アプリケーションクライアントレポジトリー
 * @class respository.client
 */
class MongoRepository {
    constructor(connection) {
        this.clientEventModel = connection.model(clientEvent_1.default.modelName);
    }
    pushEvent(clientAttributes) {
        return __awaiter(this, void 0, void 0, function* () {
            // tslint:disable-next-line:no-suspicious-comment
            // TODO クライアントの存在確認?
            // ドキュメント作成(idが既に存在していればユニーク制約ではじかれる)
            return yield this.clientEventModel.create(clientAttributes).then((doc) => doc.toObject());
        });
    }
}
exports.MongoRepository = MongoRepository;
