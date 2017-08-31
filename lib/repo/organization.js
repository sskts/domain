"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const organization_1 = require("./mongoose/model/organization");
/**
 * 組織レポジトリー
 *
 * @class OrganizationRepository
 */
class OrganizationRepository {
    constructor(connection) {
        this.organizationModel = connection.model(organization_1.default.modelName);
    }
}
exports.default = OrganizationRepository;
