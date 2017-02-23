import * as monapt from 'monapt';
import Screen from '../model/screen';

/**
 * スクリーンリポジトリ
 *
 * @interface ScreenRepository
 */
interface ScreenRepository {
    /**
     * ID検索
     *
     * @param {string} id
     */
    findById(id: string): Promise<monapt.Option<Screen>>;
    /**
     * 劇場で検索
     */
    findByTheater(theaterId: string): Promise<Screen[]>;
    /**
     * 保管する
     *
     * @param {Screen} screen スクリーン
     */
    store(screen: Screen): Promise<void>;
}

export default ScreenRepository;
