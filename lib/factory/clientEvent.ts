/**
 * アプリケーションクライアントイベントファクトリー
 * クライアントサイドで発生したイベントを生成する
 * クライアントサイドからapiを通じて生成される想定
 *
 * todo jsdoc整備(一通り実装してからやる)
 *
 * @namespace factory/clientEvent
 */

export interface IClientEvent {
    client: string;
    occurred_at: Date;
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

export function create(args: {
    client: string;
    occurred_at: Date;
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

    return {
        client: args.client,
        occurred_at: args.occurred_at,
        url: args.url,
        label: args.label,
        category: args.category,
        action: args.action,
        message: args.message,
        notes: args.notes,
        useragent: args.useragent,
        location: args.location,
        transaction: args.transaction
    };
}
