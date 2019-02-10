import { repository } from '@cinerino/domain';

import * as factory from '../factory';

export type IOwnershipInfo<T extends factory.ownershipInfo.IGoodType> =
    factory.ownershipInfo.IOwnershipInfo<factory.ownershipInfo.IGood<T>>;

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
     * 所有権を検索する
     * @deprecated Use search
     */
    // tslint:disable-next-line:no-single-line-block-comment
    /* istanbul ignore next */
    public async search4cinemasunshine<T extends factory.ownershipInfo.IGoodType>(
        searchConditions: factory.ownershipInfo.ISearchConditions4cinemasunshine<T>
    ): Promise<IOwnershipInfo<T>[]> {
        const andConditions: any[] = [
            { 'typeOfGood.typeOf': searchConditions.goodType }
        ];

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (searchConditions.identifier !== undefined) {
            andConditions.push({ identifier: searchConditions.identifier });
        }

        // 誰の所有か
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (searchConditions.ownedBy !== undefined) {
            andConditions.push({
                'ownedBy.memberOf.membershipNumber': {
                    $exists: true,
                    $eq: searchConditions.ownedBy
                }
            });
        }

        // いつの時点での所有か
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (searchConditions.ownedAt instanceof Date) {
            andConditions.push({
                ownedFrom: { $lte: searchConditions.ownedAt },
                ownedThrough: { $gte: searchConditions.ownedAt }
            });
        }

        return this.ownershipInfoModel.find({ $and: andConditions })
            .sort({ ownedFrom: 1 })
            .exec()
            .then((docs) => docs.map((doc) => doc.toObject()));
    }

    /**
     * 会員プログラムをカウントする
     * @experimental
     */
    // tslint:disable-next-line:no-single-line-block-comment
    /* istanbul ignore next */
    public async countProgramMembership(
        searchConditions: factory.ownershipInfo.ISearchProgramMembershipConditions
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
                'acquiredFrom.id': { $in: searchConditions.theaterIds }
            });
        }

        return this.ownershipInfoModel.countDocuments({ $and: andConditions }).exec();
    }

    /**
     * 会員プログラムを検索する
     */
    public async searchProgramMembership(
        searchConditions: factory.ownershipInfo.ISearchProgramMembershipConditions
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
                'acquiredFrom.id': { $in: searchConditions.theaterIds }
            });
        }

        return this.ownershipInfoModel.distinct('ownedBy.id', { $and: andConditions })
            .exec()
            .then((result) => result.length);
    }
}
