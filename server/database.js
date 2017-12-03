const mongodb = require("mongodb");

var url = "mongodb://localhost:27017/mydb";
var MongoClient = mongodb.MongoClient;

var database = null;

const connect = async () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        reject(err);
        return;
      }
      database = db;
      resolve(database);
    });
  });
};

module.exports = {
  database: (async() => {await connect();}),
  connect: connect,
  get: async () => {
    if (!database) {
      database = await connect();
    }
    return database;
  }
};