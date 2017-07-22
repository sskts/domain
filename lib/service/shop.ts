/**
 * ショップサービス
 *
 * @namespace service/shop
 */

import * as MovieTheaterOrganizationFactory from '../factory/organization/movieTheater';
import OrganizationType from '../factory/organizationType';

import OrganizationAdapter from '../adapter/organization';

export function open(organization: MovieTheaterOrganizationFactory.IOrganization) {
    return async (organizationAdapter: OrganizationAdapter) => {
        await organizationAdapter.organizationModel.findOneAndUpdate(
            {
                identifier: organization.identifier,
                typeOf: OrganizationType.MovieTheater
            },
            {
                // 存在しない場合のみ更新(既にあれば何もしない)
                $setOnInsert: organization
            },
            { upsert: true }
        ).exec();
    };
}
