import * as monapt from 'monapt';
import * as Screen from '../factory/screen';

/**
 * スクリーンリポジトリ
 *
 * @interface ScreenAdapter
 */
interface IScreenAdapter {
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

export default IScreenAdapter;
