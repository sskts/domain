import { Connection } from 'mongoose';
import organizationModel from './mongoose/model/organization';

/**
 * 組織レポジトリー
 *
 * @class OrganizationRepository
 */
export default class OrganizationRepository {
    public readonly organizationModel: typeof organizationModel;

    constructor(connection: Connection) {
        this.organizationModel = connection.model(organizationModel.modelName);
    }
}
