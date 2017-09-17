"use strict";
/**
 * 会員連絡先サービス
 * @namespace service.person.contact
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
const factory = require("@motionpicture/sskts-factory");
const AWS = require("aws-sdk");
const createDebug = require("debug");
const google_libphonenumber_1 = require("google-libphonenumber");
const debug = createDebug('sskts-domain:service:person:contact');
/**
 * retrieve contact from Amazon Cognito
 * @export
 * @function
 * @memberof service.person.contact
 */
function getContact(accessToken) {
    return () => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
                apiVersion: 'latest',
                region: 'ap-northeast-1'
            });
            cognitoIdentityServiceProvider.getUser({
                AccessToken: accessToken
            }, (err, data) => {
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    debug('cognito getUserResponse:', data);
                    const contact = {
                        givenName: '',
                        familyName: '',
                        email: '',
                        telephone: ''
                    };
                    data.UserAttributes.forEach((userAttribute) => {
                        switch (userAttribute.Name) {
                            case 'given_name':
                                contact.givenName = (userAttribute.Value !== undefined) ? userAttribute.Value : '';
                                break;
                            case 'family_name':
                                contact.familyName = (userAttribute.Value !== undefined) ? userAttribute.Value : '';
                                break;
                            case 'email':
                                contact.email = (userAttribute.Value !== undefined) ? userAttribute.Value : '';
                                break;
                            case 'phone_number':
                                if (userAttribute.Value !== undefined) {
                                    // format a phone number to a Japanese style
                                    const phoneUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
                                    const phoneNumber = phoneUtil.parse(userAttribute.Value, 'JP');
                                    contact.telephone = phoneUtil.format(phoneNumber, google_libphonenumber_1.PhoneNumberFormat.NATIONAL);
                                }
                                break;
                            default:
                                break;
                        }
                    });
                    resolve(contact);
                }
            });
        });
    });
}
exports.getContact = getContact;
/**
 * 会員プロフィール更新
 * @export
 * @function
 * @memberof service.person.contact
 */
function updateContact(accessToken, contact) {
    return () => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const phoneUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(contact.telephone, 'JP');
            debug('isValidNumber:', phoneUtil.isValidNumber(phoneNumber));
            if (!phoneUtil.isValidNumber(phoneNumber)) {
                reject(new factory.errors.Argument('telephone', 'invalid phone number format'));
                return;
            }
            const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
                apiVersion: 'latest',
                region: 'ap-northeast-1'
            });
            cognitoIdentityServiceProvider.updateUserAttributes({
                AccessToken: accessToken,
                UserAttributes: [
                    {
                        Name: 'given_name',
                        Value: contact.givenName
                    },
                    {
                        Name: 'family_name',
                        Value: contact.familyName
                    },
                    {
                        Name: 'phone_number',
                        Value: phoneUtil.format(phoneNumber, google_libphonenumber_1.PhoneNumberFormat.E164)
                    },
                    {
                        Name: 'email',
                        Value: contact.email
                    }
                ]
            }, (err) => {
                if (err instanceof Error) {
                    reject(new factory.errors.Argument('contact', err.message));
                }
                else {
                    resolve();
                }
            });
        });
    });
}
exports.updateContact = updateContact;
