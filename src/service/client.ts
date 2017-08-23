/**
 * client service
 * @namespace service/client
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import ClientAdapter from '../adapter/client';

const debug = createDebug('sskts-domain:service:client');

export type ClientOperation<T> = (clientAdapter: ClientAdapter) => Promise<T>;

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

export function pushEvent(params: IPushEventParams): ClientOperation<factory.clientEvent.IClientEvent> {
    return async (clientAdapter: ClientAdapter) => {
        // tslint:disable-next-line:no-suspicious-comment
        // TODO クライアントの存在確認

        // イベント作成
        const clientEvent = factory.clientEvent.create(params);
        debug('creating a clientEvent...', clientEvent);

        // ドキュメント作成(idが既に存在していればユニーク制約ではじかれる)
        await clientAdapter.clientEventModel.findByIdAndUpdate(clientEvent.id, clientEvent, { upsert: true }).exec();

        return clientEvent;
    };
}
