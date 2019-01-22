// tslint:disable:no-implicit-dependencies
/**
 * masterSync service test
 * @ignore
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as mongoose from 'mongoose';
import * as assert from 'power-assert';
import * as sinon from 'sinon';
// import * as util from 'util';

import { MongoRepository as CreativeWorkRepo } from '../repo/creativeWork';
import { MongoRepository as EventRepo } from '../repo/event';
import { MongoRepository as OrganizationRepo } from '../repo/organization';
import { MongoRepository as PlaceRepo } from '../repo/place';
import * as MasterSyncService from './masterSync';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.createSandbox();
});

describe('importMovies()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、エラーにならないはず', async () => {
        const filmsFromCOA = [
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum'
            },
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum'
            }
        ];
        const movie = {};
        const creativeWorkRepo = new CreativeWorkRepo(mongoose.connection);

        sandbox.mock(COA.services.master).expects('title').once().resolves(filmsFromCOA);
        sandbox.mock(factory.creativeWork.movie).expects('createFromCOA').exactly(filmsFromCOA.length).returns(movie);
        sandbox.mock(creativeWorkRepo).expects('saveMovie').exactly(filmsFromCOA.length).resolves();

        const result = await MasterSyncService.importMovies('123')({ creativeWork: creativeWorkRepo });
        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('matchWitchXML', () => {
    afterEach(() => {
        sandbox.restore();
    });

    const coaSchedule = {
        dateJouei: 'date',
        titleCode: 'title code',
        screenCode: 'screen code',
        timeBegin: 'time begin',
        timeEnd: 'time end'
    };

    const xmlSchedule = [[{
        date: 'other date',
        movie: [{
            movieShortCode: 'other title code',
            screen: [{
                screenCode: 'other screen code',
                time: [{
                    startTime: 'start time',
                    endTime: 'end time'
                }]
            }]
        }]
    }, {
        date: 'date',
        movie: [{
            movieShortCode: 'other title code',
            screen: [{
                screenCode: 'other screen code',
                time: [{
                    startTime: 'start time',
                    endTime: 'end time'
                }]
            }]
        }]
    }, {
        date: 'date',
        movie: [{
            movieShortCode: 'title code',
            screen: [{
                screenCode: 'other screen code',
                time: [{
                    startTime: 'start time',
                    endTime: 'end time'
                }]
            }]
        }]
    }, {
        date: 'date',
        movie: [{
            movieShortCode: 'title code',
            screen: [{
                screenCode: 'screen code',
                time: [{
                    startTime: 'start time',
                    endTime: 'end time'
                }]
            }]
        }]
    }, {
        date: 'date',
        movie: [{
            movieShortCode: 'title code',
            screen: [{
                screenCode: 'screen code',
                time: [{
                    startTime: 'time begin',
                    endTime: 'time end'
                }]
            }]
        }]
    }]];

    it('coaとXMLのデータが一緒の場合、結果はtrueはず', () => {
        const result = MasterSyncService.matchWithXML(<any>xmlSchedule, <any>coaSchedule);
        assert.equal(result, true);
    });

    it('coaとXMLのデータが違う場合、結果はfalseはず', () => {
        const result = MasterSyncService.matchWithXML(<any>[[xmlSchedule[0][0]]], <any>coaSchedule);
        assert.equal(result, false);
    });

    it('??', () => {
        let allMatch = true;
        // tslint:disable-next-line:max-line-length
        const xmlJson = '[{"date":"20180815","usable":true,"movie":[{"screen":[{"time":[{"available":6,"url":"","late":1,"startTime":"0900","endTime":"1130"},{"available":6,"url":"","late":0,"startTime":"1415","endTime":"1645"},{"available":6,"url":"","late":0,"startTime":"1700","endTime":"1930"},{"available":6,"url":"","late":2,"startTime":"2000","endTime":"2230"}],"name":"シネマ８","screenCode":"80"}],"movieCode":"1727600","movieShortCode":"17276","movieBranchCode":"0","name":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","eName":"","cName":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","comment":"","runningTime":136,"cmTime":14,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0900","endTime":"1101"},{"available":6,"url":"","late":0,"startTime":"1345","endTime":"1546"},{"available":6,"url":"","late":0,"startTime":"1605","endTime":"1806"},{"available":6,"url":"","late":2,"startTime":"2050","endTime":"2251"}],"name":"シネマ１","screenCode":"10"}],"movieCode":"1642100","movieShortCode":"16421","movieBranchCode":"0","name":"ゴーストバスターズ【字幕版】","eName":"Ghostbusters","cName":"ゴーストバスターズ【字幕版】","comment":"","runningTime":116,"cmTime":5,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0920","endTime":"1056"},{"available":6,"url":"","late":0,"startTime":"1430","endTime":"1606"},{"available":6,"url":"","late":0,"startTime":"1850","endTime":"2026"},{"available":6,"url":"","late":2,"startTime":"2100","endTime":"2236"}],"name":"シネマ６","screenCode":"60"}],"movieCode":"1622100","movieShortCode":"16221","movieBranchCode":"0","name":"ペット【吹替版】","eName":"The Secret Life of Pets","cName":"ペット【吹替版】","comment":"","runningTime":91,"cmTime":5,"officialSite":"","summary":""}]},{"date":"20180816","usable":true,"movie":[{"screen":[{"time":[{"available":6,"url":"","late":1,"startTime":"0900","endTime":"1130"},{"available":6,"url":"","late":0,"startTime":"1415","endTime":"1645"},{"available":6,"url":"","late":0,"startTime":"1700","endTime":"1930"},{"available":6,"url":"","late":2,"startTime":"2000","endTime":"2230"}],"name":"シネマ８","screenCode":"80"}],"movieCode":"1727600","movieShortCode":"17276","movieBranchCode":"0","name":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","eName":"","cName":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","comment":"","runningTime":136,"cmTime":14,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0900","endTime":"1101"},{"available":6,"url":"","late":0,"startTime":"1345","endTime":"1546"},{"available":6,"url":"","late":0,"startTime":"1605","endTime":"1806"},{"available":6,"url":"","late":2,"startTime":"2050","endTime":"2251"}],"name":"シネマ１","screenCode":"10"}],"movieCode":"1642100","movieShortCode":"16421","movieBranchCode":"0","name":"ゴーストバスターズ【字幕版】","eName":"Ghostbusters","cName":"ゴーストバスターズ【字幕版】","comment":"","runningTime":116,"cmTime":5,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0920","endTime":"1056"},{"available":6,"url":"","late":0,"startTime":"1430","endTime":"1606"},{"available":6,"url":"","late":0,"startTime":"1850","endTime":"2026"},{"available":6,"url":"","late":2,"startTime":"2100","endTime":"2236"}],"name":"シネマ６","screenCode":"60"}],"movieCode":"1622100","movieShortCode":"16221","movieBranchCode":"0","name":"ペット【吹替版】","eName":"The Secret Life of Pets","cName":"ペット【吹替版】","comment":"","runningTime":91,"cmTime":5,"officialSite":"","summary":""}]},{"date":"20180817","usable":true,"movie":[{"screen":[{"time":[{"available":6,"url":"","late":1,"startTime":"0900","endTime":"1130"},{"available":6,"url":"","late":0,"startTime":"1415","endTime":"1645"},{"available":6,"url":"","late":0,"startTime":"1700","endTime":"1930"},{"available":6,"url":"","late":2,"startTime":"2000","endTime":"2230"}],"name":"シネマ８","screenCode":"80"}],"movieCode":"1727600","movieShortCode":"17276","movieBranchCode":"0","name":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","eName":"","cName":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","comment":"","runningTime":136,"cmTime":14,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0900","endTime":"1101"},{"available":6,"url":"","late":0,"startTime":"1345","endTime":"1546"},{"available":6,"url":"","late":0,"startTime":"1605","endTime":"1806"},{"available":6,"url":"","late":2,"startTime":"2050","endTime":"2251"}],"name":"シネマ１","screenCode":"10"}],"movieCode":"1642100","movieShortCode":"16421","movieBranchCode":"0","name":"ゴーストバスターズ【字幕版】","eName":"Ghostbusters","cName":"ゴーストバスターズ【字幕版】","comment":"","runningTime":116,"cmTime":5,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0920","endTime":"1056"},{"available":6,"url":"","late":0,"startTime":"1430","endTime":"1606"},{"available":6,"url":"","late":0,"startTime":"1850","endTime":"2026"},{"available":6,"url":"","late":2,"startTime":"2100","endTime":"2236"}],"name":"シネマ６","screenCode":"60"}],"movieCode":"1622100","movieShortCode":"16221","movieBranchCode":"0","name":"ペット【吹替版】","eName":"The Secret Life of Pets","cName":"ペット【吹替版】","comment":"","runningTime":91,"cmTime":5,"officialSite":"","summary":""}]},{"date":"20180818","usable":false,"movie":[{"screen":[{"time":[{"available":6,"url":"","late":1,"startTime":"0900","endTime":"1130"},{"available":6,"url":"","late":0,"startTime":"1415","endTime":"1645"},{"available":6,"url":"","late":0,"startTime":"1700","endTime":"1930"},{"available":6,"url":"","late":2,"startTime":"2000","endTime":"2230"}],"name":"シネマ８","screenCode":"80"}],"movieCode":"1727600","movieShortCode":"17276","movieBranchCode":"0","name":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","eName":"","cName":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","comment":"","runningTime":136,"cmTime":14,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0900","endTime":"1101"},{"available":6,"url":"","late":0,"startTime":"1345","endTime":"1546"},{"available":6,"url":"","late":0,"startTime":"1605","endTime":"1806"},{"available":6,"url":"","late":2,"startTime":"2050","endTime":"2251"}],"name":"シネマ１","screenCode":"10"}],"movieCode":"1642100","movieShortCode":"16421","movieBranchCode":"0","name":"ゴーストバスターズ【字幕版】","eName":"Ghostbusters","cName":"ゴーストバスターズ【字幕版】","comment":"","runningTime":116,"cmTime":5,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0920","endTime":"1056"},{"available":6,"url":"","late":0,"startTime":"1430","endTime":"1606"},{"available":6,"url":"","late":0,"startTime":"1850","endTime":"2026"},{"available":6,"url":"","late":2,"startTime":"2100","endTime":"2236"}],"name":"シネマ６","screenCode":"60"}],"movieCode":"1622100","movieShortCode":"16221","movieBranchCode":"0","name":"ペット【吹替版】","eName":"The Secret Life of Pets","cName":"ペット【吹替版】","comment":"","runningTime":91,"cmTime":5,"officialSite":"","summary":""}]},{"date":"20180819","usable":false,"movie":[{"screen":[{"time":[{"available":6,"url":"","late":1,"startTime":"0900","endTime":"1130"},{"available":6,"url":"","late":0,"startTime":"1415","endTime":"1645"},{"available":6,"url":"","late":0,"startTime":"1700","endTime":"1930"},{"available":6,"url":"","late":2,"startTime":"2000","endTime":"2230"}],"name":"シネマ８","screenCode":"80"}],"movieCode":"1727600","movieShortCode":"17276","movieBranchCode":"0","name":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","eName":"","cName":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","comment":"","runningTime":136,"cmTime":14,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0900","endTime":"1101"},{"available":6,"url":"","late":0,"startTime":"1345","endTime":"1546"},{"available":6,"url":"","late":0,"startTime":"1605","endTime":"1806"},{"available":6,"url":"","late":2,"startTime":"2050","endTime":"2251"}],"name":"シネマ１","screenCode":"10"}],"movieCode":"1642100","movieShortCode":"16421","movieBranchCode":"0","name":"ゴーストバスターズ【字幕版】","eName":"Ghostbusters","cName":"ゴーストバスターズ【字幕版】","comment":"","runningTime":116,"cmTime":5,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0920","endTime":"1056"},{"available":6,"url":"","late":0,"startTime":"1430","endTime":"1606"},{"available":6,"url":"","late":0,"startTime":"1850","endTime":"2026"},{"available":6,"url":"","late":2,"startTime":"2100","endTime":"2236"}],"name":"シネマ６","screenCode":"60"}],"movieCode":"1622100","movieShortCode":"16221","movieBranchCode":"0","name":"ペット【吹替版】","eName":"The Secret Life of Pets","cName":"ペット【吹替版】","comment":"","runningTime":91,"cmTime":5,"officialSite":"","summary":""}]},{"date":"20180820","usable":false,"movie":[{"screen":[{"time":[{"available":6,"url":"","late":1,"startTime":"0900","endTime":"1130"},{"available":6,"url":"","late":0,"startTime":"1415","endTime":"1645"},{"available":6,"url":"","late":0,"startTime":"1700","endTime":"1930"},{"available":6,"url":"","late":2,"startTime":"2000","endTime":"2230"}],"name":"シネマ８","screenCode":"80"}],"movieCode":"1727600","movieShortCode":"17276","movieBranchCode":"0","name":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","eName":"","cName":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","comment":"","runningTime":136,"cmTime":14,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0900","endTime":"1101"},{"available":6,"url":"","late":0,"startTime":"1345","endTime":"1546"},{"available":6,"url":"","late":0,"startTime":"1605","endTime":"1806"},{"available":6,"url":"","late":2,"startTime":"2050","endTime":"2251"}],"name":"シネマ１","screenCode":"10"}],"movieCode":"1642100","movieShortCode":"16421","movieBranchCode":"0","name":"ゴーストバスターズ【字幕版】","eName":"Ghostbusters","cName":"ゴーストバスターズ【字幕版】","comment":"","runningTime":116,"cmTime":5,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0920","endTime":"1056"},{"available":6,"url":"","late":0,"startTime":"1430","endTime":"1606"},{"available":6,"url":"","late":0,"startTime":"1850","endTime":"2026"},{"available":6,"url":"","late":2,"startTime":"2100","endTime":"2236"}],"name":"シネマ６","screenCode":"60"}],"movieCode":"1622100","movieShortCode":"16221","movieBranchCode":"0","name":"ペット【吹替版】","eName":"The Secret Life of Pets","cName":"ペット【吹替版】","comment":"","runningTime":91,"cmTime":5,"officialSite":"","summary":""}]},{"date":"20180821","usable":false,"movie":[{"screen":[{"time":[{"available":6,"url":"","late":1,"startTime":"0900","endTime":"1130"},{"available":6,"url":"","late":0,"startTime":"1415","endTime":"1645"},{"available":6,"url":"","late":0,"startTime":"1700","endTime":"1930"},{"available":6,"url":"","late":2,"startTime":"2000","endTime":"2230"}],"name":"シネマ８","screenCode":"80"}],"movieCode":"1727600","movieShortCode":"17276","movieBranchCode":"0","name":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","eName":"","cName":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","comment":"","runningTime":136,"cmTime":14,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0900","endTime":"1101"},{"available":6,"url":"","late":0,"startTime":"1345","endTime":"1546"},{"available":6,"url":"","late":0,"startTime":"1605","endTime":"1806"},{"available":6,"url":"","late":2,"startTime":"2050","endTime":"2251"}],"name":"シネマ１","screenCode":"10"}],"movieCode":"1642100","movieShortCode":"16421","movieBranchCode":"0","name":"ゴーストバスターズ【字幕版】","eName":"Ghostbusters","cName":"ゴーストバスターズ【字幕版】","comment":"","runningTime":116,"cmTime":5,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0920","endTime":"1056"},{"available":6,"url":"","late":0,"startTime":"1430","endTime":"1606"},{"available":6,"url":"","late":0,"startTime":"1850","endTime":"2026"},{"available":6,"url":"","late":2,"startTime":"2100","endTime":"2236"}],"name":"シネマ６","screenCode":"60"}],"movieCode":"1622100","movieShortCode":"16221","movieBranchCode":"0","name":"ペット【吹替版】","eName":"The Secret Life of Pets","cName":"ペット【吹替版】","comment":"","runningTime":91,"cmTime":5,"officialSite":"","summary":""}]},{"date":"20180822","usable":false,"movie":[{"screen":[{"time":[{"available":6,"url":"","late":1,"startTime":"0900","endTime":"1130"},{"available":6,"url":"","late":0,"startTime":"1415","endTime":"1645"},{"available":6,"url":"","late":0,"startTime":"1700","endTime":"1930"},{"available":6,"url":"","late":2,"startTime":"2000","endTime":"2230"}],"name":"シネマ８","screenCode":"80"}],"movieCode":"1727600","movieShortCode":"17276","movieBranchCode":"0","name":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","eName":"","cName":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","comment":"","runningTime":136,"cmTime":14,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0900","endTime":"1101"},{"available":6,"url":"","late":0,"startTime":"1345","endTime":"1546"},{"available":6,"url":"","late":0,"startTime":"1605","endTime":"1806"},{"available":6,"url":"","late":2,"startTime":"2050","endTime":"2251"}],"name":"シネマ１","screenCode":"10"}],"movieCode":"1642100","movieShortCode":"16421","movieBranchCode":"0","name":"ゴーストバスターズ【字幕版】","eName":"Ghostbusters","cName":"ゴーストバスターズ【字幕版】","comment":"","runningTime":116,"cmTime":5,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0920","endTime":"1056"},{"available":6,"url":"","late":0,"startTime":"1430","endTime":"1606"},{"available":6,"url":"","late":0,"startTime":"1850","endTime":"2026"},{"available":6,"url":"","late":2,"startTime":"2100","endTime":"2236"}],"name":"シネマ６","screenCode":"60"}],"movieCode":"1622100","movieShortCode":"16221","movieBranchCode":"0","name":"ペット【吹替版】","eName":"The Secret Life of Pets","cName":"ペット【吹替版】","comment":"","runningTime":91,"cmTime":5,"officialSite":"","summary":""}]},{"date":"20180823","usable":false,"movie":[{"screen":[{"time":[{"available":6,"url":"","late":1,"startTime":"0900","endTime":"1130"},{"available":6,"url":"","late":0,"startTime":"1415","endTime":"1645"},{"available":6,"url":"","late":0,"startTime":"1700","endTime":"1930"},{"available":6,"url":"","late":2,"startTime":"2000","endTime":"2230"}],"name":"シネマ８","screenCode":"80"}],"movieCode":"1727600","movieShortCode":"17276","movieBranchCode":"0","name":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","eName":"","cName":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","comment":"","runningTime":136,"cmTime":14,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0900","endTime":"1101"},{"available":6,"url":"","late":0,"startTime":"1345","endTime":"1546"},{"available":6,"url":"","late":0,"startTime":"1605","endTime":"1806"},{"available":6,"url":"","late":2,"startTime":"2050","endTime":"2251"}],"name":"シネマ１","screenCode":"10"}],"movieCode":"1642100","movieShortCode":"16421","movieBranchCode":"0","name":"ゴーストバスターズ【字幕版】","eName":"Ghostbusters","cName":"ゴーストバスターズ【字幕版】","comment":"","runningTime":116,"cmTime":5,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0920","endTime":"1056"},{"available":6,"url":"","late":0,"startTime":"1430","endTime":"1606"},{"available":6,"url":"","late":0,"startTime":"1850","endTime":"2026"},{"available":6,"url":"","late":2,"startTime":"2100","endTime":"2236"}],"name":"シネマ６","screenCode":"60"}],"movieCode":"1622100","movieShortCode":"16221","movieBranchCode":"0","name":"ペット【吹替版】","eName":"The Secret Life of Pets","cName":"ペット【吹替版】","comment":"","runningTime":91,"cmTime":5,"officialSite":"","summary":""}]},{"date":"20180824","usable":false,"movie":[{"screen":[{"time":[{"available":6,"url":"","late":1,"startTime":"0900","endTime":"1130"},{"available":6,"url":"","late":0,"startTime":"1415","endTime":"1645"},{"available":6,"url":"","late":0,"startTime":"1700","endTime":"1930"},{"available":6,"url":"","late":2,"startTime":"2000","endTime":"2230"}],"name":"シネマ８","screenCode":"80"}],"movieCode":"1727600","movieShortCode":"17276","movieBranchCode":"0","name":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","eName":"","cName":"ｶﾞｰﾃﾞｨｱﾝｽﾞｵﾌﾞｷﾞｬﾗｸｼｰ:ﾘﾐｯｸｽ【吹替】","comment":"","runningTime":136,"cmTime":14,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0900","endTime":"1101"},{"available":6,"url":"","late":0,"startTime":"1345","endTime":"1546"},{"available":6,"url":"","late":0,"startTime":"1605","endTime":"1806"},{"available":6,"url":"","late":2,"startTime":"2050","endTime":"2251"}],"name":"シネマ１","screenCode":"10"}],"movieCode":"1642100","movieShortCode":"16421","movieBranchCode":"0","name":"ゴーストバスターズ【字幕版】","eName":"Ghostbusters","cName":"ゴーストバスターズ【字幕版】","comment":"","runningTime":116,"cmTime":5,"officialSite":"","summary":""},{"screen":[{"time":[{"available":6,"url":"","late":0,"startTime":"0920","endTime":"1056"},{"available":6,"url":"","late":0,"startTime":"1430","endTime":"1606"},{"available":6,"url":"","late":0,"startTime":"1850","endTime":"2026"},{"available":6,"url":"","late":2,"startTime":"2100","endTime":"2236"}],"name":"シネマ６","screenCode":"60"}],"movieCode":"1622100","movieShortCode":"16221","movieBranchCode":"0","name":"ペット【吹替版】","eName":"The Secret Life of Pets","cName":"ペット【吹替版】","comment":"","runningTime":91,"cmTime":5,"officialSite":"","summary":""}]}]';
        const xmlData = JSON.parse(xmlJson);
        // tslint:disable-next-line:max-line-length
        const coaJson = '[{"dateJouei":"20180815","titleCode":"16221","titleBranchNum":"0","timeBegin":"0920","timeEnd":"1056","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"コアデイ","availableNum":4,"rsvStartDate":"20180808","rsvEndDate":"20180815","flgEarlyBooking":"0"},{"dateJouei":"20180815","titleCode":"16221","titleBranchNum":"0","timeBegin":"1430","timeEnd":"1606","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"コアデイ","availableNum":4,"rsvStartDate":"20180808","rsvEndDate":"20180815","flgEarlyBooking":"0"},{"dateJouei":"20180815","titleCode":"16221","titleBranchNum":"0","timeBegin":"1850","timeEnd":"2026","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"コアデイ","availableNum":4,"rsvStartDate":"20180808","rsvEndDate":"20180815","flgEarlyBooking":"0"},{"dateJouei":"20180815","titleCode":"16221","titleBranchNum":"0","timeBegin":"2100","timeEnd":"2236","screenCode":"60","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"コアデイ","availableNum":4,"rsvStartDate":"20180808","rsvEndDate":"20180815","flgEarlyBooking":"0"},{"dateJouei":"20180815","titleCode":"16421","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1101","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"コアデイ","availableNum":4,"rsvStartDate":"20180808","rsvEndDate":"20180815","flgEarlyBooking":"0"},{"dateJouei":"20180815","titleCode":"16421","titleBranchNum":"0","timeBegin":"1345","timeEnd":"1546","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"コアデイ","availableNum":4,"rsvStartDate":"20180808","rsvEndDate":"20180815","flgEarlyBooking":"0"},{"dateJouei":"20180815","titleCode":"16421","titleBranchNum":"0","timeBegin":"1605","timeEnd":"1806","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"コアデイ","availableNum":4,"rsvStartDate":"20180808","rsvEndDate":"20180815","flgEarlyBooking":"0"},{"dateJouei":"20180815","titleCode":"16421","titleBranchNum":"0","timeBegin":"2050","timeEnd":"2251","screenCode":"10","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"コアデイ","availableNum":4,"rsvStartDate":"20180808","rsvEndDate":"20180815","flgEarlyBooking":"0"},{"dateJouei":"20180815","titleCode":"17276","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1130","screenCode":"80","trailerTime":14,"kbnService":"001","kbnAcoustic":"000","nameServiceDay":"コアデイ","availableNum":4,"rsvStartDate":"20180808","rsvEndDate":"20180815","flgEarlyBooking":"0"},{"dateJouei":"20180815","titleCode":"17276","titleBranchNum":"0","timeBegin":"1415","timeEnd":"1645","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"コアデイ","availableNum":4,"rsvStartDate":"20180808","rsvEndDate":"20180815","flgEarlyBooking":"0"},{"dateJouei":"20180815","titleCode":"17276","titleBranchNum":"0","timeBegin":"1700","timeEnd":"1930","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"コアデイ","availableNum":4,"rsvStartDate":"20180808","rsvEndDate":"20180815","flgEarlyBooking":"0"},{"dateJouei":"20180815","titleCode":"17276","titleBranchNum":"0","timeBegin":"2000","timeEnd":"2230","screenCode":"80","trailerTime":14,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"コアデイ","availableNum":4,"rsvStartDate":"20180808","rsvEndDate":"20180815","flgEarlyBooking":"0"},{"dateJouei":"20180816","titleCode":"16221","titleBranchNum":"0","timeBegin":"0920","timeEnd":"1056","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180809","rsvEndDate":"20180816","flgEarlyBooking":"0"},{"dateJouei":"20180816","titleCode":"16221","titleBranchNum":"0","timeBegin":"1430","timeEnd":"1606","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180809","rsvEndDate":"20180816","flgEarlyBooking":"0"},{"dateJouei":"20180816","titleCode":"16221","titleBranchNum":"0","timeBegin":"1850","timeEnd":"2026","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180809","rsvEndDate":"20180816","flgEarlyBooking":"0"},{"dateJouei":"20180816","titleCode":"16221","titleBranchNum":"0","timeBegin":"2100","timeEnd":"2236","screenCode":"60","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180809","rsvEndDate":"20180816","flgEarlyBooking":"0"},{"dateJouei":"20180816","titleCode":"16421","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1101","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180809","rsvEndDate":"20180816","flgEarlyBooking":"0"},{"dateJouei":"20180816","titleCode":"16421","titleBranchNum":"0","timeBegin":"1345","timeEnd":"1546","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180809","rsvEndDate":"20180816","flgEarlyBooking":"0"},{"dateJouei":"20180816","titleCode":"16421","titleBranchNum":"0","timeBegin":"1605","timeEnd":"1806","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180809","rsvEndDate":"20180816","flgEarlyBooking":"0"},{"dateJouei":"20180816","titleCode":"16421","titleBranchNum":"0","timeBegin":"2050","timeEnd":"2251","screenCode":"10","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180809","rsvEndDate":"20180816","flgEarlyBooking":"0"},{"dateJouei":"20180816","titleCode":"17276","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1130","screenCode":"80","trailerTime":14,"kbnService":"001","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180809","rsvEndDate":"20180816","flgEarlyBooking":"0"},{"dateJouei":"20180816","titleCode":"17276","titleBranchNum":"0","timeBegin":"1415","timeEnd":"1645","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180809","rsvEndDate":"20180816","flgEarlyBooking":"0"},{"dateJouei":"20180816","titleCode":"17276","titleBranchNum":"0","timeBegin":"1700","timeEnd":"1930","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180809","rsvEndDate":"20180816","flgEarlyBooking":"0"},{"dateJouei":"20180816","titleCode":"17276","titleBranchNum":"0","timeBegin":"2000","timeEnd":"2230","screenCode":"80","trailerTime":14,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180809","rsvEndDate":"20180816","flgEarlyBooking":"0"},{"dateJouei":"20180817","titleCode":"16221","titleBranchNum":"0","timeBegin":"0920","timeEnd":"1056","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180810","rsvEndDate":"20180817","flgEarlyBooking":"0"},{"dateJouei":"20180817","titleCode":"16221","titleBranchNum":"0","timeBegin":"1430","timeEnd":"1606","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180810","rsvEndDate":"20180817","flgEarlyBooking":"0"},{"dateJouei":"20180817","titleCode":"16221","titleBranchNum":"0","timeBegin":"1850","timeEnd":"2026","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180810","rsvEndDate":"20180817","flgEarlyBooking":"0"},{"dateJouei":"20180817","titleCode":"16221","titleBranchNum":"0","timeBegin":"2100","timeEnd":"2236","screenCode":"60","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180810","rsvEndDate":"20180817","flgEarlyBooking":"0"},{"dateJouei":"20180817","titleCode":"16421","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1101","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180810","rsvEndDate":"20180817","flgEarlyBooking":"0"},{"dateJouei":"20180817","titleCode":"16421","titleBranchNum":"0","timeBegin":"1345","timeEnd":"1546","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180810","rsvEndDate":"20180817","flgEarlyBooking":"0"},{"dateJouei":"20180817","titleCode":"16421","titleBranchNum":"0","timeBegin":"1605","timeEnd":"1806","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180810","rsvEndDate":"20180817","flgEarlyBooking":"0"},{"dateJouei":"20180817","titleCode":"16421","titleBranchNum":"0","timeBegin":"2050","timeEnd":"2251","screenCode":"10","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180810","rsvEndDate":"20180817","flgEarlyBooking":"0"},{"dateJouei":"20180817","titleCode":"17276","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1130","screenCode":"80","trailerTime":14,"kbnService":"001","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180810","rsvEndDate":"20180817","flgEarlyBooking":"0"},{"dateJouei":"20180817","titleCode":"17276","titleBranchNum":"0","timeBegin":"1415","timeEnd":"1645","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180810","rsvEndDate":"20180817","flgEarlyBooking":"0"},{"dateJouei":"20180817","titleCode":"17276","titleBranchNum":"0","timeBegin":"1700","timeEnd":"1930","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180810","rsvEndDate":"20180817","flgEarlyBooking":"0"},{"dateJouei":"20180817","titleCode":"17276","titleBranchNum":"0","timeBegin":"2000","timeEnd":"2230","screenCode":"80","trailerTime":14,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180810","rsvEndDate":"20180817","flgEarlyBooking":"0"},{"dateJouei":"20180818","titleCode":"16221","titleBranchNum":"0","timeBegin":"0920","timeEnd":"1056","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180811","rsvEndDate":"20180818","flgEarlyBooking":"0"},{"dateJouei":"20180818","titleCode":"16221","titleBranchNum":"0","timeBegin":"1430","timeEnd":"1606","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180811","rsvEndDate":"20180818","flgEarlyBooking":"0"},{"dateJouei":"20180818","titleCode":"16221","titleBranchNum":"0","timeBegin":"1850","timeEnd":"2026","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180811","rsvEndDate":"20180818","flgEarlyBooking":"0"},{"dateJouei":"20180818","titleCode":"16221","titleBranchNum":"0","timeBegin":"2100","timeEnd":"2236","screenCode":"60","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180811","rsvEndDate":"20180818","flgEarlyBooking":"0"},{"dateJouei":"20180818","titleCode":"16421","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1101","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180811","rsvEndDate":"20180818","flgEarlyBooking":"0"},{"dateJouei":"20180818","titleCode":"16421","titleBranchNum":"0","timeBegin":"1345","timeEnd":"1546","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180811","rsvEndDate":"20180818","flgEarlyBooking":"0"},{"dateJouei":"20180818","titleCode":"16421","titleBranchNum":"0","timeBegin":"1605","timeEnd":"1806","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180811","rsvEndDate":"20180818","flgEarlyBooking":"0"},{"dateJouei":"20180818","titleCode":"16421","titleBranchNum":"0","timeBegin":"2050","timeEnd":"2251","screenCode":"10","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180811","rsvEndDate":"20180818","flgEarlyBooking":"0"},{"dateJouei":"20180818","titleCode":"17276","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1130","screenCode":"80","trailerTime":14,"kbnService":"001","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180811","rsvEndDate":"20180818","flgEarlyBooking":"0"},{"dateJouei":"20180818","titleCode":"17276","titleBranchNum":"0","timeBegin":"1415","timeEnd":"1645","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180811","rsvEndDate":"20180818","flgEarlyBooking":"0"},{"dateJouei":"20180818","titleCode":"17276","titleBranchNum":"0","timeBegin":"1700","timeEnd":"1930","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180811","rsvEndDate":"20180818","flgEarlyBooking":"0"},{"dateJouei":"20180818","titleCode":"17276","titleBranchNum":"0","timeBegin":"2000","timeEnd":"2230","screenCode":"80","trailerTime":14,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180811","rsvEndDate":"20180818","flgEarlyBooking":"0"},{"dateJouei":"20180819","titleCode":"16221","titleBranchNum":"0","timeBegin":"0920","timeEnd":"1056","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180812","rsvEndDate":"20180819","flgEarlyBooking":"0"},{"dateJouei":"20180819","titleCode":"16221","titleBranchNum":"0","timeBegin":"1430","timeEnd":"1606","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180812","rsvEndDate":"20180819","flgEarlyBooking":"0"},{"dateJouei":"20180819","titleCode":"16221","titleBranchNum":"0","timeBegin":"1850","timeEnd":"2026","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180812","rsvEndDate":"20180819","flgEarlyBooking":"0"},{"dateJouei":"20180819","titleCode":"16221","titleBranchNum":"0","timeBegin":"2100","timeEnd":"2236","screenCode":"60","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180812","rsvEndDate":"20180819","flgEarlyBooking":"0"},{"dateJouei":"20180819","titleCode":"16421","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1101","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180812","rsvEndDate":"20180819","flgEarlyBooking":"0"},{"dateJouei":"20180819","titleCode":"16421","titleBranchNum":"0","timeBegin":"1345","timeEnd":"1546","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180812","rsvEndDate":"20180819","flgEarlyBooking":"0"},{"dateJouei":"20180819","titleCode":"16421","titleBranchNum":"0","timeBegin":"1605","timeEnd":"1806","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180812","rsvEndDate":"20180819","flgEarlyBooking":"0"},{"dateJouei":"20180819","titleCode":"16421","titleBranchNum":"0","timeBegin":"2050","timeEnd":"2251","screenCode":"10","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180812","rsvEndDate":"20180819","flgEarlyBooking":"0"},{"dateJouei":"20180819","titleCode":"17276","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1130","screenCode":"80","trailerTime":14,"kbnService":"001","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180812","rsvEndDate":"20180819","flgEarlyBooking":"0"},{"dateJouei":"20180819","titleCode":"17276","titleBranchNum":"0","timeBegin":"1415","timeEnd":"1645","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180812","rsvEndDate":"20180819","flgEarlyBooking":"0"},{"dateJouei":"20180819","titleCode":"17276","titleBranchNum":"0","timeBegin":"1700","timeEnd":"1930","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180812","rsvEndDate":"20180819","flgEarlyBooking":"0"},{"dateJouei":"20180819","titleCode":"17276","titleBranchNum":"0","timeBegin":"2000","timeEnd":"2230","screenCode":"80","trailerTime":14,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180812","rsvEndDate":"20180819","flgEarlyBooking":"0"},{"dateJouei":"20180820","titleCode":"16221","titleBranchNum":"0","timeBegin":"0920","timeEnd":"1056","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180813","rsvEndDate":"20180820","flgEarlyBooking":"0"},{"dateJouei":"20180820","titleCode":"16221","titleBranchNum":"0","timeBegin":"1430","timeEnd":"1606","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180813","rsvEndDate":"20180820","flgEarlyBooking":"0"},{"dateJouei":"20180820","titleCode":"16221","titleBranchNum":"0","timeBegin":"1850","timeEnd":"2026","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180813","rsvEndDate":"20180820","flgEarlyBooking":"0"},{"dateJouei":"20180820","titleCode":"16221","titleBranchNum":"0","timeBegin":"2100","timeEnd":"2236","screenCode":"60","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180813","rsvEndDate":"20180820","flgEarlyBooking":"0"},{"dateJouei":"20180820","titleCode":"16421","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1101","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180813","rsvEndDate":"20180820","flgEarlyBooking":"0"},{"dateJouei":"20180820","titleCode":"16421","titleBranchNum":"0","timeBegin":"1345","timeEnd":"1546","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180813","rsvEndDate":"20180820","flgEarlyBooking":"0"},{"dateJouei":"20180820","titleCode":"16421","titleBranchNum":"0","timeBegin":"1605","timeEnd":"1806","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180813","rsvEndDate":"20180820","flgEarlyBooking":"0"},{"dateJouei":"20180820","titleCode":"16421","titleBranchNum":"0","timeBegin":"2050","timeEnd":"2251","screenCode":"10","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180813","rsvEndDate":"20180820","flgEarlyBooking":"0"},{"dateJouei":"20180820","titleCode":"17276","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1130","screenCode":"80","trailerTime":14,"kbnService":"001","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180813","rsvEndDate":"20180820","flgEarlyBooking":"0"},{"dateJouei":"20180820","titleCode":"17276","titleBranchNum":"0","timeBegin":"1415","timeEnd":"1645","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180813","rsvEndDate":"20180820","flgEarlyBooking":"0"},{"dateJouei":"20180820","titleCode":"17276","titleBranchNum":"0","timeBegin":"1700","timeEnd":"1930","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180813","rsvEndDate":"20180820","flgEarlyBooking":"0"},{"dateJouei":"20180820","titleCode":"17276","titleBranchNum":"0","timeBegin":"2000","timeEnd":"2230","screenCode":"80","trailerTime":14,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180813","rsvEndDate":"20180820","flgEarlyBooking":"0"},{"dateJouei":"20180821","titleCode":"16221","titleBranchNum":"0","timeBegin":"0920","timeEnd":"1056","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180814","rsvEndDate":"20180821","flgEarlyBooking":"0"},{"dateJouei":"20180821","titleCode":"16221","titleBranchNum":"0","timeBegin":"1430","timeEnd":"1606","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180814","rsvEndDate":"20180821","flgEarlyBooking":"0"},{"dateJouei":"20180821","titleCode":"16221","titleBranchNum":"0","timeBegin":"1850","timeEnd":"2026","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180814","rsvEndDate":"20180821","flgEarlyBooking":"0"},{"dateJouei":"20180821","titleCode":"16221","titleBranchNum":"0","timeBegin":"2100","timeEnd":"2236","screenCode":"60","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180814","rsvEndDate":"20180821","flgEarlyBooking":"0"},{"dateJouei":"20180821","titleCode":"16421","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1101","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180814","rsvEndDate":"20180821","flgEarlyBooking":"0"},{"dateJouei":"20180821","titleCode":"16421","titleBranchNum":"0","timeBegin":"1345","timeEnd":"1546","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180814","rsvEndDate":"20180821","flgEarlyBooking":"0"},{"dateJouei":"20180821","titleCode":"16421","titleBranchNum":"0","timeBegin":"1605","timeEnd":"1806","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180814","rsvEndDate":"20180821","flgEarlyBooking":"0"},{"dateJouei":"20180821","titleCode":"16421","titleBranchNum":"0","timeBegin":"2050","timeEnd":"2251","screenCode":"10","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180814","rsvEndDate":"20180821","flgEarlyBooking":"0"},{"dateJouei":"20180821","titleCode":"17276","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1130","screenCode":"80","trailerTime":14,"kbnService":"001","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180814","rsvEndDate":"20180821","flgEarlyBooking":"0"},{"dateJouei":"20180821","titleCode":"17276","titleBranchNum":"0","timeBegin":"1415","timeEnd":"1645","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180814","rsvEndDate":"20180821","flgEarlyBooking":"0"},{"dateJouei":"20180821","titleCode":"17276","titleBranchNum":"0","timeBegin":"1700","timeEnd":"1930","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180814","rsvEndDate":"20180821","flgEarlyBooking":"0"},{"dateJouei":"20180821","titleCode":"17276","titleBranchNum":"0","timeBegin":"2000","timeEnd":"2230","screenCode":"80","trailerTime":14,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180814","rsvEndDate":"20180821","flgEarlyBooking":"0"},{"dateJouei":"20180822","titleCode":"16221","titleBranchNum":"0","timeBegin":"0920","timeEnd":"1056","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾚﾃﾞｨｰｽﾃﾞｲ","availableNum":4,"rsvStartDate":"20180815","rsvEndDate":"20180822","flgEarlyBooking":"0"},{"dateJouei":"20180822","titleCode":"16221","titleBranchNum":"0","timeBegin":"1430","timeEnd":"1606","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾚﾃﾞｨｰｽﾃﾞｲ","availableNum":4,"rsvStartDate":"20180815","rsvEndDate":"20180822","flgEarlyBooking":"0"},{"dateJouei":"20180822","titleCode":"16221","titleBranchNum":"0","timeBegin":"1850","timeEnd":"2026","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾚﾃﾞｨｰｽﾃﾞｲ","availableNum":4,"rsvStartDate":"20180815","rsvEndDate":"20180822","flgEarlyBooking":"0"},{"dateJouei":"20180822","titleCode":"16221","titleBranchNum":"0","timeBegin":"2100","timeEnd":"2236","screenCode":"60","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"ﾚﾃﾞｨｰｽﾃﾞｲ","availableNum":4,"rsvStartDate":"20180815","rsvEndDate":"20180822","flgEarlyBooking":"0"},{"dateJouei":"20180822","titleCode":"16421","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1101","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾚﾃﾞｨｰｽﾃﾞｲ","availableNum":4,"rsvStartDate":"20180815","rsvEndDate":"20180822","flgEarlyBooking":"0"},{"dateJouei":"20180822","titleCode":"16421","titleBranchNum":"0","timeBegin":"1345","timeEnd":"1546","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾚﾃﾞｨｰｽﾃﾞｲ","availableNum":4,"rsvStartDate":"20180815","rsvEndDate":"20180822","flgEarlyBooking":"0"},{"dateJouei":"20180822","titleCode":"16421","titleBranchNum":"0","timeBegin":"1605","timeEnd":"1806","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾚﾃﾞｨｰｽﾃﾞｲ","availableNum":4,"rsvStartDate":"20180815","rsvEndDate":"20180822","flgEarlyBooking":"0"},{"dateJouei":"20180822","titleCode":"16421","titleBranchNum":"0","timeBegin":"2050","timeEnd":"2251","screenCode":"10","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"ﾚﾃﾞｨｰｽﾃﾞｲ","availableNum":4,"rsvStartDate":"20180815","rsvEndDate":"20180822","flgEarlyBooking":"0"},{"dateJouei":"20180822","titleCode":"17276","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1130","screenCode":"80","trailerTime":14,"kbnService":"001","kbnAcoustic":"000","nameServiceDay":"ﾚﾃﾞｨｰｽﾃﾞｲ","availableNum":4,"rsvStartDate":"20180815","rsvEndDate":"20180822","flgEarlyBooking":"0"},{"dateJouei":"20180822","titleCode":"17276","titleBranchNum":"0","timeBegin":"1415","timeEnd":"1645","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾚﾃﾞｨｰｽﾃﾞｲ","availableNum":4,"rsvStartDate":"20180815","rsvEndDate":"20180822","flgEarlyBooking":"0"},{"dateJouei":"20180822","titleCode":"17276","titleBranchNum":"0","timeBegin":"1700","timeEnd":"1930","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾚﾃﾞｨｰｽﾃﾞｲ","availableNum":4,"rsvStartDate":"20180815","rsvEndDate":"20180822","flgEarlyBooking":"0"},{"dateJouei":"20180822","titleCode":"17276","titleBranchNum":"0","timeBegin":"2000","timeEnd":"2230","screenCode":"80","trailerTime":14,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"ﾚﾃﾞｨｰｽﾃﾞｲ","availableNum":4,"rsvStartDate":"20180815","rsvEndDate":"20180822","flgEarlyBooking":"0"},{"dateJouei":"20180823","titleCode":"16221","titleBranchNum":"0","timeBegin":"0920","timeEnd":"1056","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180816","rsvEndDate":"20180823","flgEarlyBooking":"0"},{"dateJouei":"20180823","titleCode":"16221","titleBranchNum":"0","timeBegin":"1430","timeEnd":"1606","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180816","rsvEndDate":"20180823","flgEarlyBooking":"0"},{"dateJouei":"20180823","titleCode":"16221","titleBranchNum":"0","timeBegin":"1850","timeEnd":"2026","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180816","rsvEndDate":"20180823","flgEarlyBooking":"0"},{"dateJouei":"20180823","titleCode":"16221","titleBranchNum":"0","timeBegin":"2100","timeEnd":"2236","screenCode":"60","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180816","rsvEndDate":"20180823","flgEarlyBooking":"0"},{"dateJouei":"20180823","titleCode":"16421","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1101","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180816","rsvEndDate":"20180823","flgEarlyBooking":"0"},{"dateJouei":"20180823","titleCode":"16421","titleBranchNum":"0","timeBegin":"1345","timeEnd":"1546","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180816","rsvEndDate":"20180823","flgEarlyBooking":"0"},{"dateJouei":"20180823","titleCode":"16421","titleBranchNum":"0","timeBegin":"1605","timeEnd":"1806","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180816","rsvEndDate":"20180823","flgEarlyBooking":"0"},{"dateJouei":"20180823","titleCode":"16421","titleBranchNum":"0","timeBegin":"2050","timeEnd":"2251","screenCode":"10","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180816","rsvEndDate":"20180823","flgEarlyBooking":"0"},{"dateJouei":"20180823","titleCode":"17276","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1130","screenCode":"80","trailerTime":14,"kbnService":"001","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180816","rsvEndDate":"20180823","flgEarlyBooking":"0"},{"dateJouei":"20180823","titleCode":"17276","titleBranchNum":"0","timeBegin":"1415","timeEnd":"1645","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180816","rsvEndDate":"20180823","flgEarlyBooking":"0"},{"dateJouei":"20180823","titleCode":"17276","titleBranchNum":"0","timeBegin":"1700","timeEnd":"1930","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180816","rsvEndDate":"20180823","flgEarlyBooking":"0"},{"dateJouei":"20180823","titleCode":"17276","titleBranchNum":"0","timeBegin":"2000","timeEnd":"2230","screenCode":"80","trailerTime":14,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"ﾒﾝﾊﾞｰｽﾞﾃﾞｲ","availableNum":4,"rsvStartDate":"20180816","rsvEndDate":"20180823","flgEarlyBooking":"0"},{"dateJouei":"20180824","titleCode":"16221","titleBranchNum":"0","timeBegin":"0920","timeEnd":"1056","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180817","rsvEndDate":"20180824","flgEarlyBooking":"0"},{"dateJouei":"20180824","titleCode":"16221","titleBranchNum":"0","timeBegin":"1430","timeEnd":"1606","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180817","rsvEndDate":"20180824","flgEarlyBooking":"0"},{"dateJouei":"20180824","titleCode":"16221","titleBranchNum":"0","timeBegin":"1850","timeEnd":"2026","screenCode":"60","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180817","rsvEndDate":"20180824","flgEarlyBooking":"0"},{"dateJouei":"20180824","titleCode":"16221","titleBranchNum":"0","timeBegin":"2100","timeEnd":"2236","screenCode":"60","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180817","rsvEndDate":"20180824","flgEarlyBooking":"0"},{"dateJouei":"20180824","titleCode":"16421","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1101","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180817","rsvEndDate":"20180824","flgEarlyBooking":"0"},{"dateJouei":"20180824","titleCode":"16421","titleBranchNum":"0","timeBegin":"1345","timeEnd":"1546","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180817","rsvEndDate":"20180824","flgEarlyBooking":"0"},{"dateJouei":"20180824","titleCode":"16421","titleBranchNum":"0","timeBegin":"1605","timeEnd":"1806","screenCode":"10","trailerTime":5,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180817","rsvEndDate":"20180824","flgEarlyBooking":"0"},{"dateJouei":"20180824","titleCode":"16421","titleBranchNum":"0","timeBegin":"2050","timeEnd":"2251","screenCode":"10","trailerTime":5,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180817","rsvEndDate":"20180824","flgEarlyBooking":"0"},{"dateJouei":"20180824","titleCode":"17276","titleBranchNum":"0","timeBegin":"0900","timeEnd":"1130","screenCode":"80","trailerTime":14,"kbnService":"001","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180817","rsvEndDate":"20180824","flgEarlyBooking":"0"},{"dateJouei":"20180824","titleCode":"17276","titleBranchNum":"0","timeBegin":"1415","timeEnd":"1645","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180817","rsvEndDate":"20180824","flgEarlyBooking":"0"},{"dateJouei":"20180824","titleCode":"17276","titleBranchNum":"0","timeBegin":"1700","timeEnd":"1930","screenCode":"80","trailerTime":14,"kbnService":"000","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180817","rsvEndDate":"20180824","flgEarlyBooking":"0"},{"dateJouei":"20180824","titleCode":"17276","titleBranchNum":"0","timeBegin":"2000","timeEnd":"2230","screenCode":"80","trailerTime":14,"kbnService":"002","kbnAcoustic":"000","nameServiceDay":"","availableNum":4,"rsvStartDate":"20180817","rsvEndDate":"20180824","flgEarlyBooking":"0"}]';
        const coaData = JSON.parse(coaJson);
        coaData.forEach((data: any) => {
            const test = MasterSyncService.matchWithXML(<any>[xmlData], <any>data);
            if (!test) {
                console.error(data);
                allMatch = false;
            }
        });
        assert.equal(allMatch, true);
    });
});

describe('importScreeningEvents()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、エラーにならないはず', async () => {
        const movieTheater = {
            containsPlace: [
                { branchCode: '01' },
                { branchCode: '02' }
            ]
        };
        const filmFromCOA = [
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum'
            }
        ];
        const schedulesFromCOA = [
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum',
                screenCode: '01'
            },
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum',
                screenCode: '02'
            }
        ];
        const screeningEvent = {
            identifier: 'identifier'
        };
        const individualScreeningEvent = {
            identifier: 'identifier'
        };
        const individualScreeningEventsInMongo = [
            { identifier: individualScreeningEvent.identifier },
            { identifier: 'cancellingIdentifier' }
        ];
        const eventRepo = new EventRepo(mongoose.connection);
        const placeRepo = new PlaceRepo(mongoose.connection);

        sandbox.mock(COA.services.master).expects('title').once().resolves(filmFromCOA);
        sandbox.mock(COA.services.master).expects('schedule').once().resolves(schedulesFromCOA);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(COA.services.master).expects('kubunName').exactly(6).resolves([{}]);
        sandbox.mock(eventRepo).expects('save').exactly(filmFromCOA.length + schedulesFromCOA.length);
        sandbox.mock(factory.event.screeningEventSeries).expects('createFromCOA').exactly(filmFromCOA.length)
            .returns(screeningEvent);
        sandbox.mock(placeRepo).expects('findMovieTheaterByBranchCode').once().returns(movieTheater);
        sandbox.mock(factory.event.screeningEventSeries).expects('createIdentifier').exactly(schedulesFromCOA.length)
            .returns(screeningEvent.identifier);
        sandbox.mock(factory.event.individualScreeningEvent).expects('createFromCOA').exactly(schedulesFromCOA.length)
            .returns(individualScreeningEvent);
        sandbox.mock(eventRepo).expects('searchIndividualScreeningEvents').once().resolves(individualScreeningEventsInMongo);
        sandbox.mock(eventRepo).expects('cancelIndividualScreeningEvent').once().withExactArgs('cancellingIdentifier');

        const result = await MasterSyncService.importScreeningEvents(
            '123', new Date(), new Date()
        )({ event: eventRepo, place: placeRepo });

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('XMLとCOAのデータが一緒の場合、正常で完了するはず', async () => {
        const movieTheater = {
            containsPlace: [
                { branchCode: '01' },
                { branchCode: '02' }
            ]
        };
        const filmFromCOA = [
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum'
            }
        ];
        const schedulesFromCOA = [
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum',
                screenCode: '01'
            },
            {
                titleBranchNum: 'titleBranchNum',
                dateJouei: 'date',
                titleCode: 'title code',
                screenCode: '02',
                timeBegin: 'time begin',
                timeEnd: 'time end'
            }
        ];
        const xmlSchedule = [[{
            date: 'date',
            movie: [{
                movieShortCode: 'title code',
                screen: [{
                    screenCode: '02',
                    time: [{
                        startTime: 'time begin',
                        endTime: 'time end'
                    }]
                }]
            }]
        }]];
        const screeningEvent = {
            identifier: 'identifier'
        };
        const individualScreeningEvent = {
            identifier: 'identifier'
        };
        const individualScreeningEventsInMongo = [
            { identifier: individualScreeningEvent.identifier },
            { identifier: 'cancellingIdentifier' }
        ];
        const eventRepo = new EventRepo(mongoose.connection);
        const placeRepo = new PlaceRepo(mongoose.connection);

        sandbox.mock(COA.services.master).expects('title').once().resolves(filmFromCOA);
        sandbox.mock(COA.services.master).expects('schedule').once().resolves(schedulesFromCOA);
        sandbox.mock(COA.services.master).expects('xmlSchedule').once().resolves(xmlSchedule);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(COA.services.master).expects('kubunName').exactly(6).resolves([{}]);
        sandbox.mock(eventRepo).expects('save').exactly(filmFromCOA.length + 1);
        sandbox.mock(factory.event.screeningEventSeries).expects('createFromCOA').exactly(filmFromCOA.length)
            .returns(screeningEvent);
        sandbox.mock(placeRepo).expects('findMovieTheaterByBranchCode').once().returns(movieTheater);
        sandbox.mock(factory.event.screeningEventSeries).expects('createIdentifier').exactly(1)
            .returns(screeningEvent.identifier);
        sandbox.mock(factory.event.individualScreeningEvent).expects('createFromCOA').exactly(1)
            .returns(individualScreeningEvent);
        sandbox.mock(eventRepo).expects('searchIndividualScreeningEvents').once().resolves(individualScreeningEventsInMongo);
        sandbox.mock(eventRepo).expects('cancelIndividualScreeningEvent').once().withExactArgs('cancellingIdentifier');

        const result = await MasterSyncService.importScreeningEvents(
            '123', new Date(), new Date(), { baseUrl: 'baseUrl', theaterCodeName: 'codeName' }
        )({ event: eventRepo, place: placeRepo });

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('劇場に存在しないスクリーンのスケジュールがあれば、エラー出力だけしてスルーするはず', async () => {
        const movieTheater = {
            containsPlace: [
                { branchCode: '01' },
                { branchCode: '02' }
            ]
        };
        const filmFromCOA = [
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum'
            }
        ];
        const schedulesFromCOA = [
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum',
                screenCode: 'screenCode'
            }
        ];
        const screeningEvent = {
            identifier: 'identifier'
        };
        const eventRepo = new EventRepo(mongoose.connection);
        const placeRepo = new PlaceRepo(mongoose.connection);

        sandbox.mock(COA.services.master).expects('title').once().resolves(filmFromCOA);
        sandbox.mock(COA.services.master).expects('schedule').once().resolves(schedulesFromCOA);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(COA.services.master).expects('kubunName').exactly(6).resolves([{}]);
        sandbox.mock(eventRepo).expects('save').exactly(filmFromCOA.length);
        sandbox.mock(factory.event.screeningEventSeries).expects('createFromCOA').exactly(filmFromCOA.length)
            .returns(screeningEvent);
        sandbox.mock(placeRepo).expects('findMovieTheaterByBranchCode').once().returns(movieTheater);
        sandbox.mock(factory.event.screeningEventSeries).expects('createIdentifier').exactly(schedulesFromCOA.length)
            .returns(screeningEvent.identifier);
        sandbox.mock(factory.event.individualScreeningEvent).expects('createFromCOA').never();
        sandbox.mock(eventRepo).expects('searchIndividualScreeningEvents').once().resolves([]);

        const result = await MasterSyncService.importScreeningEvents(
            '123', new Date(), new Date()
        )({ event: eventRepo, place: placeRepo });

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('上映イベントがなければ、個々の上映イベントは保管せずにスルーするはず', async () => {
        const movieTheater = {
            containsPlace: [
                { branchCode: '01' },
                { branchCode: '02' }
            ]
        };
        const filmFromCOA = [
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum'
            }
        ];
        const schedulesFromCOA = [
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum',
                screenCode: '01'
            },
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum',
                screenCode: '02'
            }
        ];
        const screeningEvent = {
            identifier: 'identifier'
        };
        const eventRepo = new EventRepo(mongoose.connection);
        const placeRepo = new PlaceRepo(mongoose.connection);

        sandbox.mock(COA.services.master).expects('title').once().resolves(filmFromCOA);
        sandbox.mock(COA.services.master).expects('schedule').once().resolves(schedulesFromCOA);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(COA.services.master).expects('kubunName').exactly(6).resolves([{}]);
        sandbox.mock(eventRepo).expects('save').exactly(filmFromCOA.length);
        sandbox.mock(factory.event.screeningEventSeries).expects('createFromCOA').exactly(filmFromCOA.length)
            .returns(screeningEvent);
        sandbox.mock(placeRepo).expects('findMovieTheaterByBranchCode').once().returns(movieTheater);
        sandbox.mock(factory.event.screeningEventSeries).expects('createIdentifier').exactly(schedulesFromCOA.length)
            .returns('invalidIdentifier');
        sandbox.mock(factory.event.individualScreeningEvent).expects('createFromCOA').never();
        sandbox.mock(eventRepo).expects('searchIndividualScreeningEvents').once().resolves([]);

        const result = await MasterSyncService.importScreeningEvents(
            '123', new Date(), new Date()
        )({ event: eventRepo, place: placeRepo });

        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('XMLエンドポイントからデータ取得するのはエラーが発生すれば処理を止まります', async () => {
        const movieTheater = {
            containsPlace: [
                { branchCode: '01' },
                { branchCode: '02' }
            ]
        };
        const filmFromCOA = [
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum'
            }
        ];
        const schedulesFromCOA = [
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum',
                screenCode: '01'
            },
            {
                titleCode: 'titleCode',
                titleBranchNum: 'titleBranchNum',
                screenCode: '02'
            }
        ];
        // const screeningEvent = {
        //     identifier: 'identifier'
        // };
        const eventRepo = new EventRepo(mongoose.connection);
        const placeRepo = new PlaceRepo(mongoose.connection);

        sandbox.mock(COA.services.master).expects('title').once().resolves(filmFromCOA);
        sandbox.mock(COA.services.master).expects('schedule').once().resolves(schedulesFromCOA);
        sandbox.mock(COA.services.master).expects('xmlSchedule').once().rejects(new Error('some random error'));
        sandbox.mock(COA.services.master).expects('kubunName').never();
        sandbox.mock(eventRepo).expects('save').never();
        sandbox.mock(factory.event.screeningEventSeries).expects('createFromCOA').never();
        sandbox.mock(placeRepo).expects('findMovieTheaterByBranchCode').once().returns(movieTheater);
        sandbox.mock(factory.event.screeningEventSeries).expects('createIdentifier').never();
        sandbox.mock(factory.event.individualScreeningEvent).expects('createFromCOA').never();
        sandbox.mock(eventRepo).expects('searchIndividualScreeningEvents').never();

        const result = await MasterSyncService.importScreeningEvents(
            '123', new Date(), new Date(), { baseUrl: 'baseUrl', theaterCodeName: 'codeName' }
        )({ event: eventRepo, place: placeRepo });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('importMovieTheater()', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('repositoryの状態が正常であれば、エラーにならないはず', async () => {
        const movieTheater = { branchCode: '', name: {} };
        const organizationRepo = new OrganizationRepo(mongoose.connection);
        const placeRepo = new PlaceRepo(mongoose.connection);

        sandbox.stub(COA.services.master, 'theater').returns({});
        sandbox.stub(COA.services.master, 'screen').returns({});
        sandbox.stub(factory.place.movieTheater, 'createFromCOA').returns(movieTheater);
        sandbox.mock(placeRepo).expects('saveMovieTheater').once();
        sandbox.mock(organizationRepo.organizationModel).expects('findOneAndUpdate').once()
            .chain('exec').resolves();

        const result = await MasterSyncService.importMovieTheater('123')({
            organization: organizationRepo,
            place: placeRepo
        });

        assert.equal(result, undefined);
        sandbox.verify();
    });
});
