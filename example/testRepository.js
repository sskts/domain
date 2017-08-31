/**
 * a sample finding movie theater
 *
 * @ignore
 */

const sskts = require('../lib/index');

const testRepository = new sskts.TestRepository('xxx');
console.log('connection:', testRepository.getConnection());
