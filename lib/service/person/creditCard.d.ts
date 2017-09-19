/**
 * 会員クレジットカードサービス
 * @namespace service.person.creditCard
 */
import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
export declare type IOperation<T> = () => Promise<T>;
export declare type IUncheckedCardRaw = factory.paymentMethod.paymentCard.creditCard.IUncheckedCardRaw;
export declare type IUncheckedCardTokenized = factory.paymentMethod.paymentCard.creditCard.IUncheckedCardTokenized;
/**
 * クレジットカード追加
 * @export
 * @function
 * @memberof service.person.creditCard
 */
export declare function save(personId: string, username: string, creditCard: IUncheckedCardRaw | IUncheckedCardTokenized): IOperation<GMO.services.card.ISearchCardResult>;
/**
 * クレジットカード削除
 * @export
 * @function
 * @memberof service.person.creditCard
 */
export declare function unsubscribe(personId: string, cardSeq: string): IOperation<void>;
/**
 * クレジットカード検索
 * @export
 * @function
 * @memberof service.person.creditCard
 */
export declare function find(personId: string, username: string): IOperation<GMO.services.card.ISearchCardResult[]>;
