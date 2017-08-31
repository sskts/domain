/**
 * ショップサービス
 *
 * @namespace service/shop
 */

import * as factory from '@motionpicture/sskts-factory';

import OrganizationRepository from '../repo/organization';

export function open(organization: factory.organization.movieTheater.IOrganization) {
    return async (organizationRepository: OrganizationRepository) => {
        await organizationRepository.organizationModel.findOneAndUpdate(
            {
                identifier: organization.identifier,
                typeOf: factory.organizationType.MovieTheater
            },
            organization,
            { upsert: true }
        ).exec();
    };
}
