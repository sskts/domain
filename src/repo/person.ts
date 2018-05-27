import * as factory from '@motionpicture/sskts-factory';
import * as AWS from 'aws-sdk';
import * as createDebug from 'debug';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

const debug = createDebug('sskts-domain:repository:person');
const CUSTOM_ATTRIBUTE_NAME_ACCOUNT_NUMBER = 'accountNumbers';

/**
 * 会員リポジトリー
 * 会員情報の保管先は基本的にAmazon Cognitoです。
 */
export class CognitoRepository {
    public readonly cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider;

    constructor(cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider) {
        this.cognitoIdentityServiceProvider = cognitoIdentityServiceProvider;
    }

    public static ATTRIBUTE2CONTACT(userAttributes: AWS.CognitoIdentityServiceProvider.AttributeListType) {
        const contact: factory.person.IContact = {
            givenName: '',
            familyName: '',
            email: '',
            telephone: ''
        };

        userAttributes.forEach((userAttribute) => {
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
                    // tslint:disable-next-line:no-single-line-block-comment
                    /* istanbul ignore else */
                    if (userAttribute.Value !== undefined) {
                        // format a phone number to a Japanese style
                        const phoneUtil = PhoneNumberUtil.getInstance();
                        const phoneNumber = phoneUtil.parse(userAttribute.Value, 'JP');
                        contact.telephone = phoneUtil.format(phoneNumber, PhoneNumberFormat.NATIONAL);
                    }
                    break;
                default:
            }
        });

        return contact;
    }

    public async getAccountNumbers(username: string) {
        return new Promise<string[]>((resolve, reject) => {
            this.cognitoIdentityServiceProvider.adminGetUser(
                {
                    UserPoolId: <string>process.env.COGNITO_USER_POOL_ID,
                    Username: username
                },
                (err, data) => {
                    if (err instanceof Error) {
                        reject(err);
                    } else {
                        if (data.UserAttributes === undefined) {
                            reject(new Error('UserAttributes not found.'));
                        } else {
                            const attribute = data.UserAttributes.find((a) => a.Name === `custom:${CUSTOM_ATTRIBUTE_NAME_ACCOUNT_NUMBER}`);
                            resolve((attribute !== undefined && attribute.Value !== undefined) ? JSON.parse(attribute.Value) : []);
                        }
                    }
                });
        });
    }

    public async  getUserAttributes(params: {
        userPooId: string;
        username: string;
    }) {
        return new Promise<factory.person.IContact>((resolve, reject) => {
            this.cognitoIdentityServiceProvider.adminGetUser(
                {
                    UserPoolId: params.userPooId,
                    Username: params.username
                },
                (err, data) => {
                    if (err instanceof Error) {
                        reject(err);
                    } else {
                        if (data.UserAttributes === undefined) {
                            reject(new Error('UserAttributes not found.'));
                        } else {
                            resolve(CognitoRepository.ATTRIBUTE2CONTACT(data.UserAttributes));
                        }
                    }
                });
        });
    }

    public async findById(params: {
        userPooId: string;
        userId: string;
    }) {
        return new Promise<factory.person.IContact>((resolve, reject) => {
            this.cognitoIdentityServiceProvider.listUsers(
                {
                    UserPoolId: params.userPooId,
                    Filter: `sub="${params.userId}"`
                },
                (err, data) => {
                    if (err instanceof Error) {
                        reject(err);
                    } else {
                        if (data.Users === undefined) {
                            reject(new Error('Users not found.'));
                        } else {
                            const user = data.Users.shift();
                            if (user === undefined || user.Attributes === undefined) {
                                throw new factory.errors.NotFound('User');
                            }
                            resolve(CognitoRepository.ATTRIBUTE2CONTACT(user.Attributes));
                        }
                    }
                });
        });
    }

    /**
     * retrieve contact from Amazon Cognito
     */
    public async getUserAttributesByAccessToken(accessToken: string): Promise<factory.person.IContact> {
        return new Promise<factory.person.IContact>((resolve, reject) => {
            this.cognitoIdentityServiceProvider.getUser(
                {
                    AccessToken: accessToken
                },
                (err, data) => {
                    if (err instanceof Error) {
                        reject(err);
                    } else {
                        resolve(CognitoRepository.ATTRIBUTE2CONTACT(data.UserAttributes));
                    }
                });
        });
    }

    /**
     * 会員プロフィール更新
     */
    public async updateContactByAccessToken(params: {
        accessToken: string;
        contact: factory.person.IContact;
    }): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let formatedPhoneNumber: string;
            try {
                const phoneUtil = PhoneNumberUtil.getInstance();
                const phoneNumber = phoneUtil.parse(params.contact.telephone, 'JP');
                debug('isValidNumber:', phoneUtil.isValidNumber(phoneNumber));
                if (!phoneUtil.isValidNumber(phoneNumber)) {
                    throw new Error('Invalid phone number format.');
                }

                formatedPhoneNumber = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
            } catch (error) {
                reject(new factory.errors.Argument('telephone', 'invalid phone number format'));

                return;
            }

            this.cognitoIdentityServiceProvider.updateUserAttributes(
                {
                    AccessToken: params.accessToken,
                    UserAttributes: [
                        {
                            Name: 'given_name',
                            Value: params.contact.givenName
                        },
                        {
                            Name: 'family_name',
                            Value: params.contact.familyName
                        },
                        {
                            Name: 'phone_number',
                            Value: formatedPhoneNumber
                        },
                        {
                            Name: 'email',
                            Value: params.contact.email
                        }
                    ]
                },
                (err) => {
                    if (err instanceof Error) {
                        reject(new factory.errors.Argument('contact', err.message));
                    } else {
                        resolve();
                    }
                });
        });
    }
}
