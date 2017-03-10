/// <reference types="mongoose" />
/**
 * オブジェクトID
 *
 * @interface ObjectId
 */
import * as mongoose from 'mongoose';
declare type ObjectId = mongoose.Types.ObjectId;
declare const ObjectId: mongoose.Types.ObjectIdConstructor;
export default ObjectId;
