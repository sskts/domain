import * as monapt from 'monapt';
import * as Screen from '../model/screen';

/**
 * スクリーンリポジトリ
 *
 * @interface ScreenRepository
 */
interface IScreenRepository {
    /**
     * ID検索
     *
     * @param {string} id
     */
    findById(id: string): Promise<monapt.Option<Screen.IScreen>>;
    /**
     * 劇場で検索
     */
    findByTheater(theaterId: string): Promise<Screen.IScreen[]>;
    /**
     * 保管する
     *
     * @param {Screen} screen スクリーン
     */
    store(screen: Screen.IScreen): Promise<void>;
}

export default IScreenRepository;
