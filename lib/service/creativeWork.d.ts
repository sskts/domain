import CreativeWorkRepository from '../repository/creativeWork';
/**
 * 映画作品インポート
 */
export declare function importMovies(theaterCode: string): (creativeWorkRepository: CreativeWorkRepository) => Promise<void>;
