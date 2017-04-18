/**
 * ArgumentNullError
 *
 * @class ArgumentNullError
 * @extends {Error}
 */
export default class ArgumentNullError extends Error {
    readonly argumentName: string;
    constructor(argumentName: string, message?: string);
}
