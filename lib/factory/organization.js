"use strict";
/**
 * 組織ファクトリー
 *
 * @namespace factory/organization
 */
Object.defineProperty(exports, "__esModule", { value: true });
function create(args) {
    return {
        id: (args.id === undefined) ? '' : args.id,
        identifier: args.identifier,
        name: args.name,
        legalName: (args.legalName === undefined) ? { ja: '', en: '' } : args.legalName,
        typeOf: args.typeOf,
        location: args.location,
        telephone: args.telephone,
        url: (args.url !== undefined) ? args.url.toString() : undefined
    };
}
exports.create = create;
