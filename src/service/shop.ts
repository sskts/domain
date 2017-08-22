/**
 * ショップサービス
 *
 * @namespace service/shop
 */

import * as factory from '@motionpicture/sskts-factory';

import OrganizationAdapter from '../adapter/organization';

export function open(organization: factory.organization.movieTheater.IOrganization) {
    return async (organizationAdapter: OrganizationAdapter) => {
        await organizationAdapter.organizationModel.findOneAndUpdate(
            {
                identifier: organization.identifier,
                typeOf: factory.organizationType.MovieTheater
            },
            organization,
            { upsert: true }
        ).exec();
    };
}
