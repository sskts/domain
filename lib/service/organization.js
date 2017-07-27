"use strict";
/**
 * 組織サービス
 *
 * @namespace service/organization
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const organizationType_1 = require("../factory/organizationType");
const debug = createDebug('sskts-domain:service:organization');
/**
 * 劇場検索
 */
function searchMovieTheaters(searchConditions) {
    return (organizationAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 検索条件を作成
        const conditions = {
            typeOf: organizationType_1.default.MovieTheater
        };
        debug('searchConditions:', searchConditions);
        // todo 検索条件を指定できるように改修
        debug('finding places...', conditions);
        return yield organizationAdapter.organizationModel.find(conditions, 'typeOf location name kanaName sameAs')
            .setOptions({ maxTimeMS: 10000 })
            .exec()
            .then((docs) => {
            return docs.map((doc) => {
                const movieTheater = doc.toObject();
                return {
                    id: movieTheater.id,
                    typeOf: movieTheater.typeOf,
                    location: movieTheater.location,
                    name: movieTheater.name,
                    // kanaName: movieTheater.kanaName,
                    sameAs: movieTheater.sameAs
                };
            });
        });
    });
}
exports.searchMovieTheaters = searchMovieTheaters;
/**
 * 枝番号で劇場検索
 */
// export function findMovieTheaterByBranchCode(
//     branchCode: string
// ): IOrganizationOperation<monapt.Option<MovieTheaterOrganizationFactory.IOrganization>> {
//     return async (organizationAdapter: OrganizationAdapter) => {
//         return await organizationAdapter.organizationModel.findOne({
//             typeOf: OrganizationType.MovieTheater,
//             'location.branchCide': branchCode
//         }).lean()
//             .exec()
//             .then((movieTheater: MovieTheaterPlaceFactory.IPlace) => {
//                 (movieTheater === null) ? monapt.None : monapt.Option(movieTheater)
//             });
//     };
// }
