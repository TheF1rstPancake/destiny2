const axios = require("axios");
const sqlite = require("sqlite3");

var WAIT = 0; // the amount of time to wait before actually making the request
var manifest = null;

function timeoutify(f, time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(f());
      } catch (err) {
        reject(err);
      }
    }, time);
  })
  ;
};

if (process.env.DESTINY_API_KEY === undefined || process.env.DESTINY_API_KEY === null) {
  throw "DESTINY_API_KEY variable not set";
}
var requests = axios.create({
  baseURL: 'https://bungie.net/Platform/',
  headers: { 'X-API-Key': process.env.DESTINY_API_KEY }
});
var getAxios = () => {
  return axios.create({
    baseURL: 'https://bungie.net/',
    headers: { 'X-API-Key': process.env.DESTINY_API_KEY }
  });
};

async function getPGCR2(pgcr_id) {
  return await requests.get(`/Destiny2/Stats/PostGameCarnageReport/${ pgcr_id }`);
}

async function getPGCR(pgcr_id, options) {
  options = options === undefined ? {} : options;
  options.num_retries = options.num_retries === undefined ? 5 : options.num_retries;
  options.delay_increase = options.delay_increase === undefined ? 500 : options.delay_increase;

  var num_retries = 0;
  while (num_retries < options.num_retries) {
    var data = await timeoutify(async () => {
      
      try {
        var response =  await requests.get(`/Destiny2/Stats/PostGameCarnageReport/${ pgcr_id }`);
        if (response.data.ErrorCode === 1653) {
          console.log(`${ pgcr_id } does not exist`);
          return;
        }

        return response.data.Response;
      } catch (err) {
         // if there was an error at this point, retry the request
        console.log("ERROR GETTING DATA: ", err.Error, err.config.url);
        return null;
      }
    }, WAIT);

    // if we made the request, break out of the retry loop
    // and decrease the wait time
    if (data !== null) {
      if (WAIT > 0) {
        WAIT -= options.delay_increase;
        if (WAIT < 0) {
          WAIT = 0;
        }
      }
      return data;
    }
    WAIT += options.delay_increase;
    if (WAIT >= 300000) {

    }
    console.log(`Waiting ${ WAIT } milliseconds on retry ${ num_retries }`);
  }
  return null;
}

async function getManifest() {
  
}

module.exports = {
  requests: requests,
  getPGCR: getPGCR,
  getAxios: getAxios,
  manifest: () => {

  }
};