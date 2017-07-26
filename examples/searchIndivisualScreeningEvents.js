"use strict";
/**
 * 上映会イベント検索
 *
 * @ignore
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
const createDebug = require("debug");
const moment = require("moment");
const mongoose = require("mongoose");
const redis = require("redis");
const sskts = require("../lib/index");
const debug = createDebug('sskts-domain:examples');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const redisClient = redis.createClient({
            host: process.env.TEST_REDIS_HOST,
            port: process.env.TEST_REDIS_PORT,
            password: process.env.TEST_REDIS_KEY,
            tls: { servername: process.env.TEST_REDIS_HOST }
        });
        try {
            mongoose.Promise = global.Promise;
            const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
            const performances = yield sskts.service.event.searchIndividualScreeningEvents({
                day: moment().format('YYYYMMDD'),
                theater: '118'
            })(sskts.adapter.event(connection)
            // sskts.adapter.stockStatus.performance(redisClient)
            );
            debug(performances);
        }
        catch (error) {
            console.error(error);
        }
        redisClient.quit();
        mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
