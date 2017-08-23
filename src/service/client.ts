/**
 * client service
 * @namespace service/client
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import ArgumentError from '../error/argument';

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
        // クライアントの存在確認
        const clientDoc = await clientAdapter.clientModel.findById(params.client, '_id').exec();
        if (clientDoc === null) {
            throw new ArgumentError('client', `client[${params.client}] not found.`);
        }

        // イベント作成
        const clientEvent = factory.clientEvent.create(params);
        debug('creating a clientEvent...', clientEvent);

        // ドキュメント作成(idが既に存在していればユニーク制約ではじかれる)
        await clientAdapter.clientEventModel.findByIdAndUpdate(clientEvent.id, clientEvent, { upsert: true }).exec();

        return clientEvent;
    };
}
