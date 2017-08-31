/**
 * client service
 * @namespace service/client
 */
import * as factory from '@motionpicture/sskts-factory';
import ClientRepository from '../repository/client';
export declare type ClientOperation<T> = (clientRepository: ClientRepository) => Promise<T>;
export interface IPushEventParams {
    client: string;
    occurredAt: Date;
    url?: string;
    label: string;
    category?: string;
    action?: string;
    message?: string;
    notes?: string;
    useragent?: string;
    location?: number[];
    transaction?: string;
}
export declare function pushEvent(params: IPushEventParams): ClientOperation<factory.clientEvent.IClientEvent>;
