/**
 * 組織サービス
 *
 * @namespace service/organization
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import OrganizationAdapter from '../adapter/organization';

const debug = createDebug('sskts-domain:service:organization');

export type IOrganizationOperation<T> = (organizationAdapter: OrganizationAdapter) => Promise<T>;

/**
 * 劇場検索
 */
export function searchMovieTheaters(
    searchConditions: {}
): IOrganizationOperation<factory.organization.movieTheater.IPublicFields[]> {
    return async (organizationAdapter: OrganizationAdapter) => {
        // 検索条件を作成
        const conditions: any = {
            typeOf: factory.organizationType.MovieTheater
        };
        debug('searchConditions:', searchConditions);

        // todo 検索条件を指定できるように改修

        debug('searching movie theaters...', conditions);

        // GMOのセキュアな情報を公開しないように注意
        return <factory.organization.movieTheater.IPublicFields[]>await organizationAdapter.organizationModel.find(
            conditions,
            'identifier name legalName typeOf location url branchCode parentOrganization gmoInfo.shopId'
        )
            .setOptions({ maxTimeMS: 10000 })
            .exec()
            .then((docs) => docs.map((doc) => doc.toObject()));
    };
}

/**
 * 枝番号で劇場検索
 */
export function findMovieTheaterByBranchCode(
    branchCode: string
): IOrganizationOperation<factory.organization.movieTheater.IPublicFields> {
    return async (organizationAdapter: OrganizationAdapter) => {
        const doc = await organizationAdapter.organizationModel.findOne(
            {
                typeOf: factory.organizationType.MovieTheater,
                'location.branchCode': branchCode
            },
            'identifier name legalName typeOf location url branchCode parentOrganization gmoInfo.shopId'
        ).exec();

        if (doc === null) {
            throw new factory.errors.NotFound('movieTheater');
        }

        return <factory.organization.movieTheater.IPublicFields>doc.toObject();
    };
}
