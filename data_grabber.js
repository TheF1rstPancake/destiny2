const mongodb = require("mongodb");
const bungie = require("./bungie");
var RateLimiter = require('limiter').RateLimiter;
var parseArgs = require('minimist');
var Promise = require("bluebird");



/*Define global and constants*/
var START_ID = 100000000;
var JUMP = 10000;
var MIN_JUMP = 5000;
var START_TIME = Math.floor(new Date() / 1000);


/*helper functions*/
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function* getNextID (start_id, end_id, min_jump, max_jump) {
  min_jump = min_jump === undefined ? 1 : min_jump;
  max_jump = max_jump === undefined ? 1000 : max_jump;
  getNextID.running = true;

  /*first generate the IDs one at a time */
  while (start_id <= end_id) {    
    start_id = start_id + getRandomInt(min_jump, max_jump);    
    yield start_id;
  }
  getNextID.running = false;
}
getNextID.running = true;


async function writeToMongo(data, collection) {
    // and write to mongo

  var response = await collection.insert(data);
  console.log(`${ data.id } write result: `, response);
  return response;
}

/**
 * Parse and write to mongo
 * @param {integer} pgcr_id 
 * @param {JSON response from API} response 
 * @param {MongoDB collection where response should be written} collection 
 */
async function parseID(pgcr_id, response, collection) {
  var data = response.data.Response;

  // seeing an odd error around activityDetails not being populated.  Figure out what that is
  if (data === undefined) {
    console.log("Activity Details is undefined: ", response.data);
    return false;
  }

  // check for both all PVP and PVECompetitive (Gambit)
  if (data.activityDetails.modes.indexOf(5) === -1 && data.activityDetails.modes.indexOf(64) === -1) {
    return (false);
  }
 
  // we are going to make instanceID a unique index, and mode another index
  // that will improve our ability to search by gametype
  // also make the period an explicit date type so we can leverage date functions within mongo
  data.id = data.activityDetails.instanceId;
  data.mode = data.activityDetails.mode;
  data.period = new Date(data.period);
  
  // write to mongo
  console.log(`Writing ${ pgcr_id } (${ data.period }) to Mongo`);
  try {

    writeToMongo(data, collection);
  } catch (err) {
          // code 11000 means we've already seen this ID before
           // keep moving on regardless, but only log the unknowns
    if (err.code !== 11000) {
      console.log("UNKOWN MONGO ERR: ", err);
    } 
  }
    
  console.log(`RESPONSE: ${ data.id } : ${ data.mode }`);
  console.log(`Running for ${ (new Date()/1000) - START_TIME } seconds at ${ new Date() }`);
  console.log("---------------");
  return data.id;
}

async function fetchID(pgcr_id, collection, options) {
  /**
   * pgcr_id --     the id of the PGCR that we are fetching
   * num_req --     which number request this is (used for logging)
   * collection --  the Mongo collection to write to
   * options    --  additional options
   * 
   */
  var now = new Date();
  console.log(`Starting ${ pgcr_id }: ${ now.toISOString() } `);
  try {
    var response = await bungie.requests.get(`/Destiny2/Stats/PostGameCarnageReport/${ pgcr_id }`);
    now = new Date();
    console.log(`Finished ${ pgcr_id }: ${ now.toISOString() } `);
  } catch (e) {
    console.log("ERR FETCHING ID: ", e);
    return false;
  }
  if (response.data.ErrorCode === 1653) {
    console.log(`${ pgcr_id } does not exist`);
    return false;
  } else if (response.data.ErrorCode === 31) {
    console.log(`${ pgcr_id } -- exceeded throttle limit`);
    return false;
  }

  var parsed = await parseID(pgcr_id, response, collection);
  return parsed;
}

async function scrape(start_id, end_id, min_jump, max_jump, collection, options) {
  var now = new Date();

  await Promise.map(getNextID(start_id, end_id, min_jump, max_jump), function(pgcr_id) {
    return fetchID(pgcr_id, collection);
  }, { concurrency: options.rate }).then((results) => {
    console.log("Total requests: ", results.length);
    var num_pvp = 0;
    for (var i in results) {
      if (results[i] !== false) {
        num_pvp++;
      }
    }
    console.log("Number PVP: ", num_pvp);
    var diff = ((new Date()) - now)/1000;
    console.log("Requests per second: ", results.length/diff);
  });
  console.log("DONE");
}

/**
 * Perform a binary search on the PGCRs to find the first ID and last ID within the start_date and end_date
 * 
 * @param {Date} start_date 
 * @param {Date} end_date 
 */
async function findIdAfterDate(date, max_id, collection, options) {
  var limiter = new RateLimiter(options.rate, 1000);

  // find a single record with the start date less than or equal to what we passed.
  // we add a 6 hour buffer around the time
  // if we can't find one, then just use the start_date passed
  const six_hours = 60*60*6*1000;
  var min_start = new Date(date.getTime() - six_hours);
  var max_start = new Date(date.getTime() + six_hours);

  // check if we already have an ID in our database that we can use as a starting point
  var response = await collection.find(
      { period: { "$gte": min_start.toISOString(), "$lte": max_start.toISOString() } }
    ).sort(['period', 1])
    .limit(1).toArray();
  
  // if no such ID exists, then start at the beginning via the API
  var start_id = 1;
  if (response.length !== 0) {
    start_id = parseInt(response[0].id);
    console.log("Found max start date in database: ", start_id);
  }

  // hit the destiny API to find an ID that matches our requirements
  while (start_id <= max_id) {
    var mid = Math.floor((max_id + start_id)/2);
    var pgcr_id = mid;

    // make sure not to get throttled
    var can = await limiter.tryRemoveTokens(1);
    while (!can) {
      can = await limiter.tryRemoveTokens(1);
    }
    try {
      var response = await bungie.requests.get(`/Destiny2/Stats/PostGameCarnageReport/${ pgcr_id }`);
    } catch (e) {
      console.log("ERR: ", e);
      continue;
    }
    
    if (response.data.ErrorCode === 1653) {
      console.log(`${ pgcr_id } does not exist`);
      max_id = pgcr_id;
    } else {
      var d = new Date(response.data.Response.period);
      if (d > max_start) {
        max_id = pgcr_id - 1;
      } else if (d < min_start) {
        start_id = pgcr_id + 1;
      } else {
        return pgcr_id;
      }
    }
  }
  return pgcr_id;
}


// find the max possible ID
// this currently way overshoots the possible max
// but it's just to give us a bookend so we can do a binary search later
async function findMaxId(collection) {
  // in order for binary search to work, we need to find the max possible id currently available
  // so we will do some funny magic here
  var latest = await collection.find({}, { 'period': 1, 'id': 1 }).sort(['period', -1]).limit(1).toArray();
  var latest_id = 1;
  if (latest.length !== 0) {
    latest_id = parseInt(latest[0].id);
  }  
  var limiter = new RateLimiter(argv.rate, 1000);

  // find the max ID
  var latest_id = latest_id+1;
  var jump_factor = 2.5;
  var end_id = Math.floor(latest_id * jump_factor);
  console.log("Latest known: ", latest_id);

  while (jump_factor > 1) {
    console.log("Checking ", end_id);
    var can = await limiter.tryRemoveTokens(1);
    while (!can) {
      can = await limiter.tryRemoveTokens(1);
    }

    // make the request
    try {
      var response = await bungie.requests(`/Destiny2/Stats/PostGameCarnageReport/${ end_id }`);
    } catch (e) {
      console.log("ERR: ", e);
      continue;
    }
    if (response.data.ErrorCode === 1653) {
      console.log("Went too far: ", end_id);
      jump_factor = jump_factor/2;
      end_id = parseInt(end_id/jump_factor, 10);
      console.log("New end_id and jump factor", end_id, jump_factor);
    } else {
      latest_id = end_id;
      end_id = parseInt(end_id * jump_factor, 10);
    }    
  }

  return end_id;
}

 
/** run the script */
if (require.main === module) {
  /*MONGO connect and run*/
  var url = "mongodb://localhost:27017/mydb";
  var MongoClient = mongodb.MongoClient;
  var DB_CONNECTION = null;

  /*handle CTRL+C event */
  process.on('SIGINT', function() {
    console.log("Caught interrupt signal");

    DB_CONNECTION.close();
    process.exit();
  });

  // parse command line
  var now = new Date();
  console.log(`${ now.getFullYear() }-${ now.getMonth() }-${ now.getDay() }`);
  var argv = parseArgs(process.argv.slice(2), {
    default: {
      start_date: "2017-09-06",
      end_date: `${ now.getFullYear() }-${ now.getMonth() + 1 }-${ now.getDate() + 1 }`,
      min_jump: 1,
      max_jump: 5000,
      rate: 10 // how many calls to make per second
    }
  });

  argv.start_date = new Date(argv.start_date);
  argv.end_date = new Date(argv.end_date);
  console.log("ARGUMENTS: ", argv);
  MongoClient.connect(url, async function(err, db) {
    if (err) {
      throw err;
    }
    DB_CONNECTION = db;
    console.log("Database created!");

    try {  
      var collection =  await db.createCollection("PGCR");
    } catch (err) {
      throw err;
    }

   // create indeces
    collection.createIndex({ id: 1 }, { unique: true });
    collection.createIndex({ mode: 1 });
    collection.createIndex({ period: -1 });
    console.log("Collection created!");
  
    var end_id = await findMaxId(collection, argv);
    console.log("Max possible ID is: ", end_id);

    console.log("Narrowing end_id");
    end_id = await findIdAfterDate(argv.end_date, end_id, collection, argv);
    console.log("New end_id: ", end_id);

    console.log("Creating start_id");
    var start_id = await findIdAfterDate(argv.start_date, end_id, collection, argv);
    console.log("Found start ID close to start_date: ", start_id);
  
    // the ID we are going to start with will be the latest one we have available
    // if there is nothing in the database, then that should be the START_ID
    // otherwise, use the ID we pulled and add 1 to it to get the next ID
    console.log("Begin scarping");
    scrape(start_id, end_id, argv.min_jump, argv.max_jump, collection, argv)
        .then(() => {process.exit(0);})
        .catch((err) => {
          console.log(err);
          process.exit(1);
        });
  });
}
