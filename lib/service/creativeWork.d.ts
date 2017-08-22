import CreativeWorkAdapter from '../adapter/creativeWork';
/**
 * 映画作品インポート
 */
export declare function importMovies(theaterCode: string): (creativeWorkAdapter: CreativeWorkAdapter) => Promise<void>;
