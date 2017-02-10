/**
 * オブジェクトIDファクトリー
 *
 * @namespace ObjectIdFactory
 */
"use strict";
const objectId_1 = require("../model/objectId");
/**
 * オブジェクトIDを作成する
 *
 *
 * @returns {ObjectId}
 *
 * @memberof ObjectIdFactory
 */
function create(id) {
    return objectId_1.default(id);
}
exports.create = create;
