"use strict";
/**
 * 承認ファクトリー
 *
 * 誰が、誰に対して、何の所有を、承認するのか
 * 何の所有を、というのは承認グループによって異なる
 *
 * @namespace factory/authorization
 */
Object.defineProperty(exports, "__esModule", { value: true });
var OwnerType;
(function (OwnerType) {
    OwnerType["Organization"] = "Organization";
    OwnerType["Person"] = "Person";
})(OwnerType = exports.OwnerType || (exports.OwnerType = {}));
