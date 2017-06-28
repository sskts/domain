import SSKTSError from '../error';
/**
 * AlreadyInUseError
 *
 * @class AlreadyInUseError
 * @extends {SSKTSError}
 */
export default class AlreadyInUseError extends SSKTSError {
    readonly entityName: string;
    readonly fieldNames: string[];
    constructor(entityName: string, fieldNames: string[], message?: string);
}
