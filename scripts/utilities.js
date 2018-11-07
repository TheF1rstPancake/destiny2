var fs = require("fs");
var mongodb = require('mongodb');

var url = "mongodb://localhost:27017/mydb";
var MongoClient = mongodb.MongoClient;

function connectDatabase() {
  var p = new Promise((resolve, reject) => {
    MongoClient.connect(url, async function(err, db) {
      if (err) {
        reject(err);
      }
      resolve(db);
    });
  });
  return p;
}

function _writeFile(filename, data) {
  var p = new Promise((resolve, reject) => {
    fs.writeFile(filename, data, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
  return p;
}

module.exports = {
  writeFile: async function(filename, data) {
    var full_file_path = `./public/graph_data/${ filename }`;

    var r = await _writeFile(full_file_path, JSON.stringify(data, null, 2));
    return r;
  },
  runScript: async function(script) {
    try {
      var db = await connectDatabase();
    } catch (err) {
      console.log("ERR CONNECTING: ", err);
      process.exit(1);
    }

    try {
      await script(db);
      console.log("Finished script");
      process.exit(0);
    } catch (err) {
      console.log("Script failed: ", err);
      process.exit(1);
    }
    
  },

};