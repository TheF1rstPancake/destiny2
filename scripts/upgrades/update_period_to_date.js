const mongodb = require("mongodb");

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

  MongoClient.connect(url, async function(err, db) {
    try {  
      var collection = db.collection("PGCR");
    } catch (err) {
      throw err;
    }

    var bulkUpdateOps = [];
    var results = collection.find({}, { sort: { period: 1 } });
    var written = 0;
    results.forEach(function(doc) {
      bulkUpdateOps.push(
        {
          "updateOne": {
            "filter": { "_id": doc._id },
            "update": { "$set": { "period": new Date(doc.period) } }
          }
        }
        );
      if (bulkUpdateOps.length === 1000) {
        written += 1000;
        console.log("Written: ", written);
        collection.bulkWrite(bulkUpdateOps);
        bulkUpdateOps = [];
      }
    });
    if (bulkUpdateOps.length > 0) { 
      written += bulkUpdateOps.length;
      console.log("Written remaining: ", written);
      collection.bulkWrite(bulkUpdateOps); 
    }
  });
}