import * as monapt from 'monapt';
import * as Theater from '../model/theater';
/**
 * 劇場リポジトリ
 *
 * @interface TheaterRepository
 */
interface ITheaterRepository {
    /**
     * ID検索
     *
     * @param {string} id
     */
    findById(id: string): Promise<monapt.Option<Theater.ITheater>>;
    /**
     * 保管する
     *
     * @param {Theater} theater 劇場
     */
    store(theater: Theater.ITheater): Promise<void>;
}
export default ITheaterRepository;
