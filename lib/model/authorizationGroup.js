/**
 * 承認グループ
 *
 * @namespace AuthorizationGroup
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AuthorizationGroup;
(function (AuthorizationGroup) {
    /**
     * 内部資産管理
     */
    AuthorizationGroup.ASSET = 'ASSET';
    /**
     * COA座席予約資産管理
     */
    AuthorizationGroup.COA_SEAT_RESERVATION = 'COA_SEAT_RESERVATION';
    /**
     * GMO資産管理
     */
    AuthorizationGroup.GMO = 'GMO';
    /**
     * ムビチケ資産管理
     */
    AuthorizationGroup.MVTK = 'MVTK';
})(AuthorizationGroup || (AuthorizationGroup = {}));
exports.default = AuthorizationGroup;
