/**
 * ArgumentError
 *
 * @class ArgumentError
 * @extends {Error}
 */
export default class ArgumentError extends Error {
    readonly argumentName: string;
    constructor(argumentName: string, message?: string);
}
