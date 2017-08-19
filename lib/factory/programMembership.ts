/**
 * 会員プログラムファクトリー
 *
 * @namespace factory/programMembership
 */

import * as OrganizationFactory from './organization';

export interface IProgramMembership {
    hostingOrganization?: OrganizationFactory.IOrganization;
    membershipNumber: string;
    programName: string;
}
