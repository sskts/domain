"use strict";
const objectId_1 = require("../model/objectId");
/**
 * オブジェクトIDファクトリー
 *
 * @namespace ObjectIdFactory
 */
var ObjectIdFactory;
(function (ObjectIdFactory) {
    /**
     * オブジェクトIDを作成する
     *
     * @export
     * @returns {ObjectId}
     *
     * @memberof ObjectIdFactory
     */
    function create(id) {
        return objectId_1.default(id);
    }
    ObjectIdFactory.create = create;
})(ObjectIdFactory || (ObjectIdFactory = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ObjectIdFactory;
