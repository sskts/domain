"use strict";
/**
 * mongodbコネクションオプション
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const options = {
    server: {
        socketOptions: {
            autoReconnect: true,
            keepAlive: 300000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 0
        },
        reconnectTries: 30,
        reconnectInterval: 1000
    },
    replset: {
        socketOptions: {
            keepAlive: 300000,
            connectTimeoutMS: 30000
        }
    }
};
exports.default = options;
