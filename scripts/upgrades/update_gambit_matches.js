const mongodb = require("mongodb");
const bungie = require("../../bungie");
var parseArgs = require('minimist');
var Promise = require("bluebird");
const data_grabber = require('../../data_grabber');


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

    
  
    // the ID we are going to start with will be the latest one we have available
    // if there is nothing in the database, then that should be the START_ID
    // otherwise, use the ID we pulled and add 1 to it to get the next ID
    console.log("Begin updating");
    var matches = await (collection.find({ "activityDetails.mode": 63, "teams": { $size: 0 } }, { "id": 1 }).toArray());
    var bulkUpdateOps = [];
    var written = 0;
    var chunks = 100;
    var p = await Promise.map(matches, async function(m) {
      var p = await data_grabber.fetchID(m.id, collection, { write: false });
      if (p === false) {
        return;
      }
      bulkUpdateOps.push({
        "replaceOne": {
          "filter": { "_id": m._id },
          "replacement": p
        }
      });
      if (bulkUpdateOps.length >= chunks) {
        written += bulkUpdateOps.length;
        console.log("Writing: ", written);
        var r = await collection.bulkWrite(bulkUpdateOps);
        console.log("Finished bulk write: ", r.insertedCount);
        bulkUpdateOps = [];
      }
    }, { concurrency: 8 });
    if (bulkUpdateOps.length > 0) {
      written += bulkUpdateOps.length;
      console.log("Final clean up: ", written);
      await collection.bulkWrite(bulkUpdateOps);
    }

    console.log("Done");
    process.exit(0);
  });
   
}

