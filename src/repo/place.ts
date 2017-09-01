import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import { Connection } from 'mongoose';
import placeModel from './mongoose/model/place';

const debug = createDebug('sskts-domain:repository:place');

/**
 * 場所レポジトリー
 *
 * @class PlaceRepository
 */
export default class PlaceRepository {
    public readonly placeModel: typeof placeModel;

    constructor(connection: Connection) {
        this.placeModel = connection.model(placeModel.modelName);
    }

    /**
     * save a movie theater
     * 劇場を保管する
     * @param movieTheater movieTheater object
     */
    public async saveMovieTheater(movieTheater: factory.place.movieTheater.IPlace) {
        await this.placeModel.findOneAndUpdate(
            {
                branchCode: movieTheater.branchCode
            },
            movieTheater,
            { upsert: true }
        ).exec();
    }

    /**
     * 劇場検索
     */
    public async searchMovieTheaters(
        searchConditions: {}
    ): Promise<factory.place.movieTheater.IPlaceWithoutScreeningRoom[]> {
        // 検索条件を作成
        const conditions: any = {
            typeOf: factory.placeType.MovieTheater
        };
        debug('searchConditions:', searchConditions);

        // todo 検索条件を指定できるように改修

        debug('finding places...', conditions);

        return await this.placeModel.find(conditions, 'typeOf branchCode name kanaName url')
            .setOptions({ maxTimeMS: 10000 })
            .exec()
            .then((docs) => {
                return docs.map((doc) => {
                    const movieTheater = <factory.place.movieTheater.IPlace>doc.toObject();

                    return {
                        typeOf: movieTheater.typeOf,
                        screenCount: movieTheater.screenCount,
                        branchCode: movieTheater.branchCode,
                        name: movieTheater.name,
                        kanaName: movieTheater.kanaName,
                        url: movieTheater.url
                    };
                });

            });
    }

    /**
     * 枝番号で劇場検索
     */
    public async findMovieTheaterByBranchCode(
        branchCode: string
    ): Promise<factory.place.movieTheater.IPlace> {
        const doc = await this.placeModel.findOne({
            typeOf: factory.placeType.MovieTheater,
            branchCode: branchCode
        }).exec();

        if (doc === null) {
            throw new factory.errors.NotFound('movieTheater');
        }

        return <factory.place.movieTheater.IPlace>doc.toObject();
    }
}
