/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import organizationModel from './mongoose/model/organization';
/**
 * 組織アダプター
 *
 * @class OrganizationAdapter
 */
export default class OrganizationAdapter {
    readonly organizationModel: typeof organizationModel;
    constructor(connection: Connection);
}
