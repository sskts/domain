/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import placeModel from './mongoose/model/place';
/**
 * 場所アダプター
 *
 * @class PlaceAdapter
 */
export default class PlaceAdapter {
    readonly placeModel: typeof placeModel;
    constructor(connection: Connection);
}
