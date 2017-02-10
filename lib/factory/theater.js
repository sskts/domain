"use strict";
/**
 * 劇場ファクトリー
 *
 * @namespace
 */
var TheaterFactory;
(function (TheaterFactory) {
    function create(args) {
        return {
            _id: args._id,
            name: args.name,
            name_kana: args.name_kana,
            address: args.address,
        };
    }
    TheaterFactory.create = create;
    function createFromCOA(theaterFromCOA) {
        return create({
            _id: theaterFromCOA.theater_code,
            name: {
                ja: theaterFromCOA.theater_name,
                en: theaterFromCOA.theater_name_eng,
            },
            name_kana: theaterFromCOA.theater_name_kana,
            address: {
                ja: "",
                en: "",
            },
        });
    }
    TheaterFactory.createFromCOA = createFromCOA;
})(TheaterFactory || (TheaterFactory = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TheaterFactory;
