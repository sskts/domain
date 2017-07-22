"use strict";
/**
 * 作品ファクトリー
 *
 * @namespace factory/creativeWork
 */
Object.defineProperty(exports, "__esModule", { value: true });
function create(args) {
    return {
        identifier: args.identifier,
        name: args.name,
        description: args.description,
        copyrightHolder: args.copyrightHolder,
        copyrightYear: args.copyrightYear,
        datePublished: args.datePublished,
        license: (args.license !== undefined) ? args.license.toString() : undefined,
        thumbnailUrl: (args.thumbnailUrl !== undefined) ? args.thumbnailUrl.toString() : undefined,
        typeOf: args.typeOf
    };
}
exports.create = create;
