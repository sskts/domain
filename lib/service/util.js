"use strict";
/**
 * util service
 * ユーティリティサービス
 * @namespace service.util
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const azureStorage = require("azure-storage");
const createDebug = require("debug");
const debug = createDebug('sskts-domain:service:util');
/**
 * ファイルをアップロードする
 * @param fileName ファイル
 * @param text ファイルコンテンツ
 */
function uploadFile(fileName, text) {
    return () => __awaiter(this, void 0, void 0, function* () {
        return yield new Promise((resolve, reject) => {
            // save to blob
            const blobService = azureStorage.createBlobService();
            const CONTAINER = 'files-from-sskts-domain-util-service';
            blobService.createContainerIfNotExists(CONTAINER, {}, (createContainerError) => {
                if (createContainerError instanceof Error) {
                    reject(createContainerError);
                    return;
                }
                blobService.createBlockBlobFromText(CONTAINER, fileName, text, (createBlockBlobError, result, response) => {
                    debug(createBlockBlobError, result, response);
                    if (createBlockBlobError instanceof Error) {
                        reject(createBlockBlobError);
                        return;
                    }
                    // 期限つきのURLを発行する
                    const startDate = new Date();
                    const expiryDate = new Date(startDate);
                    // tslint:disable-next-line:no-magic-numbers
                    expiryDate.setMinutes(startDate.getMinutes() + 10);
                    // tslint:disable-next-line:no-magic-numbers
                    startDate.setMinutes(startDate.getMinutes() - 10);
                    const sharedAccessPolicy = {
                        AccessPolicy: {
                            Permissions: azureStorage.BlobUtilities.SharedAccessPermissions.READ,
                            Start: startDate,
                            Expiry: expiryDate
                        }
                    };
                    const token = blobService.generateSharedAccessSignature(result.container, result.name, sharedAccessPolicy);
                    resolve(blobService.getUrl(result.container, result.name, token));
                });
            });
        });
    });
}
exports.uploadFile = uploadFile;
