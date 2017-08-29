const COA = require('@motionpicture/coa-service');
const fs = require('fs');

kubunClasses = [];

Promise.all(Array.from(Array(200)).map(async (i, index) => {
    const kubunClass = `000${index}`.slice(-3);

    // COAから区分マスター抽出
    const kubunNames = await COA.services.master.kubunName({
        theaterCode: '118',
        kubunClass: kubunClass
    });

    if (kubunNames.length > 0) {
        kubunClasses.push({
            index: index,
            kubunClass: kubunClass,
            kubunNames: kubunNames
        })
    }
})).then(() => {
    kubunClasses = kubunClasses.sort((a, b) => {
        return a.index - b.index;
    });
    console.log('kubunClasses:', kubunClasses);
    fs.writeFileSync(`${__dirname}/kubunClasses.json`, JSON.stringify(kubunClasses, null, '    '));
});
