import { repository } from '@cinerino/domain';

import * as factory from '../factory';

export type IOwnershipInfo<T extends factory.ownershipInfo.IGoodType> =
    factory.ownershipInfo.IOwnershipInfo<factory.ownershipInfo.IGood<T>>;

export interface ISearchProgramMembershipConditions {
    /**
     * 劇場ID
     */
    theaterIds: string[];
    /**
     * 登録日MIN
     */
    createdAtFrom: Date;
    /**
     * 登録日MAX
     */
    createdAtTo: Date;
}

/**
 * 所有権リポジトリ
 */
export class MongoRepository extends repository.OwnershipInfo {
    /**
     * 所有権情報を保管する
     * @param ownershipInfo ownershipInfo object
     */
    public async saveByIdentifier(ownershipInfo: IOwnershipInfo<factory.ownershipInfo.IGoodType>) {
        await this.ownershipInfoModel.findOneAndUpdate(
            {
                identifier: ownershipInfo.identifier
            },
            ownershipInfo,
            { upsert: true }
        ).exec();
    }

    /**
     * 会員プログラムをカウントする
     * @experimental
     */
    // tslint:disable-next-line:no-single-line-block-comment
    /* istanbul ignore next */
    public async countProgramMembership(
        searchConditions: ISearchProgramMembershipConditions
    ): Promise<number> {
        const andConditions: any[] = [
            { 'typeOfGood.typeOf': 'ProgramMembership' }
        ];

        andConditions.push({
            createdAt: {
                $lte: searchConditions.createdAtTo,
                $gte: searchConditions.createdAtFrom
            }
        });

        if (Array.isArray(searchConditions.theaterIds)) {
            andConditions.push({
                'acquiredFrom.id': {
                    $exists: true,
                    $in: searchConditions.theaterIds
                }
            });
        }

        return this.ownershipInfoModel.countDocuments({ $and: andConditions })
            .exec();
    }

    /**
     * 会員プログラムを検索する
     */
    public async searchProgramMembership(
        searchConditions: ISearchProgramMembershipConditions
    ): Promise<number> {
        const andConditions: any[] = [
            { 'typeOfGood.typeOf': 'ProgramMembership' }
        ];

        andConditions.push({
            createdAt: {
                $lte: searchConditions.createdAtTo,
                $gte: searchConditions.createdAtFrom
            }
        });

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (Array.isArray(searchConditions.theaterIds)) {
            andConditions.push({
                'acquiredFrom.id': {
                    $exists: true,
                    $in: searchConditions.theaterIds
                }
            });
        }

        return this.ownershipInfoModel.distinct('ownedBy.id', { $and: andConditions })
            .exec()
            .then((result) => result.length);
    }
}
