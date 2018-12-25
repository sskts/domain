import * as factory from '@motionpicture/sskts-factory';
import { Connection, Types } from 'mongoose';
import ownershipInfoModel from './mongoose/model/ownershipInfo';

export type IOwnershipInfo<T extends factory.ownershipInfo.IGoodType> = factory.ownershipInfo.IOwnershipInfo<T>;

/**
 * 所有権リポジトリー
 */
export class MongoRepository {
    public readonly ownershipInfoModel: typeof ownershipInfoModel;

    constructor(connection: Connection) {
        this.ownershipInfoModel = connection.model(ownershipInfoModel.modelName);
    }

    /**
     * 所有権情報を保管する
     * @param ownershipInfo ownershipInfo object
     */
    public async save(ownershipInfo: factory.ownershipInfo.IOwnershipInfo<factory.ownershipInfo.IGoodType>) {
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
     */
    public async search<T extends factory.ownershipInfo.IGoodType>(
        searchConditions: factory.ownershipInfo.ISearchConditions<T>
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

        if (searchConditions.theaterIds.length > 0) {
            let theaterIdArray: Types.ObjectId[];
            try {
                theaterIdArray = searchConditions.theaterIds.map((id) => {
                    return new Types.ObjectId(id);
                });
            } catch (__) {
                throw new Error('theaterIds not valid');
            }
            andConditions.push({
                'acquiredFrom.id': { $in: theaterIdArray }
            });
        }

        return this.ownershipInfoModel.distinct('ownedBy.id', { $and: andConditions })
            .exec()
            .then((result) => result.length);
    }
}
