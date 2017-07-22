/**
 * アプリケーションクライアントイベントファクトリー
 * クライアントサイドで発生したイベントを生成する
 * クライアントサイドからapiを通じて生成される想定
 *
 * todo jsdoc整備(一通り実装してからやる)
 *
 * @namespace factory/clientEvent
 */

import ObjectId from './objectId';

export interface IClientEvent {
    id: string;
    client: string;
    occurredAt: Date;
    url: string;
    label: string;
    category: string;
    action: string;
    message: string;
    notes: string;
    useragent: string;
    location: number[];
    transaction?: string;
}

export function create(args: {
    id?: string;
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
}): IClientEvent {
    // todo validation

    const event: IClientEvent = {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        client: args.client,
        occurredAt: args.occurredAt,
        url: (args.url !== undefined) ? args.url : '',
        label: args.label,
        category: (args.category !== undefined) ? args.category : '',
        action: (args.action !== undefined) ? args.action : '',
        message: (args.message !== undefined) ? args.message : '',
        notes: (args.notes !== undefined) ? args.notes : '',
        useragent: (args.useragent !== undefined) ? args.useragent : '',
        location: (args.location !== undefined) ? args.location : []
    };

    if (args.transaction !== undefined) {
        event.transaction = args.transaction;
    }

    return event;
}
