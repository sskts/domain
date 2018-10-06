/**
 * 会員検索サンプル
 */
const sskts = require('../../');

async function main() {
    const personRepo = new sskts.repository.Person(new sskts.AWS.CognitoIdentityServiceProvider({
        apiVersion: 'latest',
        region: 'ap-northeast-1',
        credentials: new sskts.AWS.Credentials({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        })
    }));
    const people = await personRepo.search({
        userPooId: process.env.COGNITO_USER_POOL_ID,
        // username: 'p',
        // familyName: 'ヨ',
        // givenName: 'シ'
    });
    console.log('people:', people);
    console.log(people.length, 'people found');
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
