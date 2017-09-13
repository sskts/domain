/// <reference types="node" />
/**
 * ファイルをアップロードする
 * @param fileName ファイル
 * @param text ファイルコンテンツ
 */
export declare function uploadFile(fileName: string, text: string | Buffer): () => Promise<string>;
