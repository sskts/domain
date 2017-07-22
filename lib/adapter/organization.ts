import { Connection } from 'mongoose';
import organizationModel from './mongoose/model/organization';

/**
 * 組織アダプター
 *
 * @class OrganizationAdapter
 */
export default class OrganizationAdapter {
    public readonly organizationModel: typeof organizationModel;

    constructor(connection: Connection) {
        this.organizationModel = connection.model(organizationModel.modelName);
    }
}
