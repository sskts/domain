import SSKTSError from '../error';
/**
 * ArgumentNullError
 *
 * @class ArgumentNullError
 * @extends {SSKTSError}
 */
export default class ArgumentNullError extends SSKTSError {
    readonly argumentName: string;
    constructor(argumentName: string, message?: string);
}
