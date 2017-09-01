/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import organizationModel from './mongoose/model/organization';
/**
 * 組織レポジトリー
 *
 * @class OrganizationRepository
 */
export default class OrganizationRepository {
    readonly organizationModel: typeof organizationModel;
    constructor(connection: Connection);
    /**
     * find a movie theater by id
     * IDで劇場組織を取得する
     * @param id organization id
     */
    findMovieTheaterById(id: string): Promise<factory.organization.movieTheater.IOrganization>;
    /**
     * save a movie theater
     * 劇場を保管する
     * @param movieTheater movieTheater object
     */
    openMovieTheaterShop(movieTheater: factory.organization.movieTheater.IOrganization): Promise<void>;
    /**
     * 劇場検索
     */
    searchMovieTheaters(searchConditions: {}): Promise<factory.organization.movieTheater.IPublicFields[]>;
    /**
     * 枝番号で劇場検索
     */
    findMovieTheaterByBranchCode(branchCode: string): Promise<factory.organization.movieTheater.IPublicFields>;
}
