/// <reference types="mongoose" />
/**
 * スクリーンリポジトリ
 *
 * @class ScreenRepositoryInterpreter
 */
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import Screen from '../../model/screen';
import ScreenRepository from '../screen';
export default class ScreenRepositoryInterpreter implements ScreenRepository {
    readonly connection: Connection;
    constructor(connection: Connection);
    findById(id: string): Promise<monapt.Option<Screen>>;
    findByTheater(args: {
        /**
         * 劇場ID
         */
        theater_id: string;
    }): Promise<Screen[]>;
    store(screen: Screen): Promise<void>;
}
