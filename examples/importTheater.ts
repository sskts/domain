import mongoose = require("mongoose");
import * as SSKTS from "../lib/sskts-domain";

process.env.MONGOLAB_URI = "mongodb://testsasakiticketmongodbuser:aZHGD262LNsBTQgG9UGQpA6QvbFkKbAhBfxf3vvz@ds056379-a0.mlab.com:56379,ds056379-a1.mlab.com:56372/testsasakiticketmongodb?replicaSet=rs-ds056379";
process.env.SENDGRID_API_KEY = "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";
process.env.GMO_ENDPOINT = "https://pt01.mul-pay.jp";
process.env.COA_ENDPOINT = "http://coacinema.aa0.netvolante.jp";
process.env.COA_REFRESH_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkX2F0IjoxNDc5MjYwODQ4LCJhdXRoX2lkIjoiMzMxNSJ9.jx-w7D3YLP7UbY4mzJYC9xr368FiKWcpR2_L9mZfehQ";

async function main() {
    try {
        mongoose.Promise = global.Promise;
        mongoose.connect(process.env.MONGOLAB_URI);

        await SSKTS.createMasterService().importTheater("001")(SSKTS.createTheaterRepository(mongoose.connection));
    } catch (error) {
        console.error(error);
    }

    mongoose.disconnect();
    process.exit(0);
}

main();