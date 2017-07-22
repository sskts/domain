/**
 * 作品ファクトリー
 *
 * @namespace factory/creativeWork
 */

import CreativeWorkType from './creativeWorkType';

export interface ICopyrightHolder {
    name: string;
}

export interface ICreativeWork {
    identifier: string;
    name: string;
    description?: string;
    copyrightHolder?: ICopyrightHolder;
    copyrightYear?: number;
    datePublished?: Date;
    license?: string;
    thumbnailUrl?: string;
    typeOf: CreativeWorkType;
}

export function create(args: {
    identifier: string;
    name: string;
    description?: string;
    copyrightHolder?: ICopyrightHolder;
    copyrightYear?: number;
    datePublished?: Date;
    license?: URL;
    thumbnailUrl?: URL;
    typeOf: CreativeWorkType;
}): ICreativeWork {
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
