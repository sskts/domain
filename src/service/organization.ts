/**
 * 組織サービス
 *
 * @namespace service/organization
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as monapt from 'monapt';

import OrganizationAdapter from '../adapter/organization';

const debug = createDebug('sskts-domain:service:organization');

export type IOrganizationOperation<T> = (organizationAdapter: OrganizationAdapter) => Promise<T>;

/**
 * 劇場検索条件インターフェース
 */
export interface ISearchMovieTheatersConditions {
    name?: string;
}

/**
 * 劇場検索結果インターフェース
 */
export type IMovieTheater = factory.organization.movieTheater.IOrganizationWithoutGMOInfo & {
    /**
     * GMO情報
     */
    gmoInfo: {
        shopId: string;
    };
};

/**
 * 劇場検索
 */
export function searchMovieTheaters(
    searchConditions: ISearchMovieTheatersConditions
): IOrganizationOperation<IMovieTheater[]> {
    return async (organizationAdapter: OrganizationAdapter) => {
        // 検索条件を作成
        const conditions: any = {
            typeOf: factory.organizationType.MovieTheater
        };
        debug('searchConditions:', searchConditions);

        // todo 検索条件を指定できるように改修

        debug('searching movie theaters...', conditions);

        // GMOのセキュアな情報を公開しないように注意
        return <IMovieTheater[]>await organizationAdapter.organizationModel.find(
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
): IOrganizationOperation<monapt.Option<IMovieTheater>> {
    return async (organizationAdapter: OrganizationAdapter) => {
        return await organizationAdapter.organizationModel.findOne(
            {
                typeOf: factory.organizationType.MovieTheater,
                'location.branchCode': branchCode
            },
            'identifier name legalName typeOf location url branchCode parentOrganization gmoInfo.shopId'
        )
            .exec()
            .then((doc) => {
                return (doc === null) ? monapt.None : monapt.Option(<IMovieTheater>doc.toObject());
            });
    };
}
