/**
 * 会員連絡先サービス
 * @namespace service.person.contact
 */
import * as factory from '@motionpicture/sskts-factory';
/**
 * retrieve contact from Amazon Cognito
 * @export
 * @function
 * @memberof service.person.contact
 */
export declare function getContact(accessToken: string): () => Promise<factory.person.IContact>;
/**
 * 会員プロフィール更新
 * @export
 * @function
 * @memberof service.person.contact
 */
export declare function updateContact(accessToken: string, contact: factory.person.IContact): () => Promise<void>;
