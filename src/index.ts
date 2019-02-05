// tslint:disable:max-classes-per-file completed-docs
/**
 * sskts-domain index module
 */
import { AWS, pecorinoapi } from '@cinerino/domain';
import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as redis from 'redis';

import * as errorHandler from './errorHandler';
import * as factory from './factory';
import * as repository from './repository';
import * as service from './service';

/**
 * MongoDBクライアント`mongoose`
 * @example
 * var promise = mongoose.connect('mongodb://localhost/myapp', {
 *     useMongoClient: true
 * });
 */
// export import mongoose = mongoose;

/**
 * Redis Cacheクライアント
 * @example
 * const client = sskts.redis.createClient({
 *      host: process.env.REDIS_HOST,
 *      port: process.env.REDIS_PORT,
 *      password: process.env.REDIS_KEY,
 *      tls: { servername: process.env.TEST_REDIS_HOST }
 * });
 */
export import redis = redis;

/**
 * COAのAPIクライアント
 * @example
 * sskts.COA.services.master.theater({ theater_code: '118' }).then(() => {
 *     console.log(result);
 * });
 */
export import COA = COA;

/**
 * GMOのAPIクライアント
 * @example
 * sskts.GMO.services.card.searchMember({
 *     siteId: '',
 *     sitePass: '',
 *     memberId: ''
 * }).then((result) => {
 *     console.log(result);
 * });
 */
export import GMO = GMO;

/**
 * Pecorino APIクライアント
 * Pecorinoサービスとの連携は全てこのクライアントを通じて行います。
 */
export import pecorinoapi = pecorinoapi;

/**
 * AWS SDK
 */
export import AWS = AWS;

export import errorHandler = errorHandler;
export import factory = factory;
export import repository = repository;
export import service = service;
