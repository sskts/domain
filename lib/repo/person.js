"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const person_1 = require("./mongoose/model/person");
/**
 * 人物レポジトリー
 *
 * @class PersonRepository
 */
class MongoRepository {
    constructor(connection) {
        this.personModel = connection.model(person_1.default.modelName);
    }
}
exports.MongoRepository = MongoRepository;
