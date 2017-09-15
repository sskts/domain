/// <reference types="node" />
/**
 * ファイルをアップロードする
 * @export
 * @function
 * @memberof service.util
 * @param {string} params.fileName ファイル
 * @param {string | Buffer} params.text ファイルコンテンツ
 * @param {Date} [params.expiryDate] ファイルコンテンツ
 */
export declare function uploadFile(params: {
    fileName: string;
    text: string | Buffer;
    expiryDate?: Date;
}): () => Promise<string>;
