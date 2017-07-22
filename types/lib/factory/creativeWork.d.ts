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
export declare function create(args: {
    identifier: string;
    name: string;
    description?: string;
    copyrightHolder?: ICopyrightHolder;
    copyrightYear?: number;
    datePublished?: Date;
    license?: URL;
    thumbnailUrl?: URL;
    typeOf: CreativeWorkType;
}): ICreativeWork;
