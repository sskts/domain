import SSKTSError from '../error';
/**
 * ArgumentError
 *
 * @class ArgumentError
 * @extends {SSKTSError}
 */
export default class ArgumentError extends SSKTSError {
    readonly argumentName: string;
    constructor(argumentName: string, message?: string);
}
