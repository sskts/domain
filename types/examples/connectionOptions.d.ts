/**
 * mongodbコネクションオプション
 *
 * @ignore
 */
declare const options: {
    server: {
        socketOptions: {
            autoReconnect: boolean;
            keepAlive: number;
            connectTimeoutMS: number;
            socketTimeoutMS: number;
        };
        reconnectTries: number;
        reconnectInterval: number;
    };
    replset: {
        socketOptions: {
            keepAlive: number;
            connectTimeoutMS: number;
        };
    };
};
export default options;
