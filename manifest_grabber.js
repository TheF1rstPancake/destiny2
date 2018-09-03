const mongodb = require("mongodb");
const bungie = require("./bungie");
//var zlib = require("zlib");
var unzip = require("unzip");
// sqlite and file system functionality for 
var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");
var Promise = require("bluebird");

/**
   * Get manifest definition from bungie
   * Check if we already have a manifest file downloaded
   * If the file names are the same, then we are done
   * If they are different, then we need to download the new one and dump to mongo
   * we will also move the old one into a temp storage
   */
async function getManifest() {
  console.log("Requesting Bungie manifest details");
  try {
    var response = await bungie.requests.get("/Destiny2/Manifest", { timeout: 10000 });
  } catch (err) {
    console.log(err.message);
    throw err;
  }
  var current_manifest_file = fs.readdirSync('./').filter(fn => fn.endsWith('.content'))[0];
  var bungie_manifest_file = response.data.Response.mobileWorldContentPaths.en;

  var l = bungie_manifest_file.split("/");
  var new_manifest_file = l[l.length-1];
  console.log("Received details");


  // the files are the same, we are done
  if (current_manifest_file === new_manifest_file) {
    console.log("No change to manifest");
    return { manifest_file_name: current_manifest_file, update: false };
  }

  // the files are different.  Check if we even have an existing file, and if we do, move it to a temporary location
  var update = false;
  if (current_manifest_file !== undefined && current_manifest_file !== null) {
    update = true;
    var new_location = `./retired_manifests/${ (new Date()).toISOString() }_${ current_manifest_file }`;
    fs.rename(current_manifest_file, new_location, function(err) {
      if (err) {throw err;}
      console.log("Manifests are different.  Moved existing file into retired storage");
    });
  }

  console.log(current_manifest_file, new_manifest_file);

  console.log("Fetching manifest");
  var axios = bungie.getAxios();
  response = await axios.get(bungie_manifest_file, { timeout: 20000, responseType: 'arraybuffer' });
  var compressed_manifest = response.data;
  console.log("Received manifest");
  try {
    fs.writeFileSync("./temp.zip", compressed_manifest);
    var manifest = await (new Promise((resolve, reject) => {
      fs.createReadStream('./temp.zip').pipe(unzip.Extract({ path: './' }))
        .on("error", reject)
        .on("close", resolve);
    }));
  } catch (err) {
    console.log(err);
    throw err;
  }

  return { manifest_file_name: new_manifest_file, update: update };
}
  
  /**
   * Convert the SQLite manifest table into a set of Mongo collections
   * We need to be careful on how we manage a new manifest file.  
   * One option is to purge the existing collections (if they exist) and re-write
   * The other option is to modify the existing values and add new ones, but keep the collections intact
   * Yet another option would be to create a versioning system that would let us track new manifests and changes
   * 
   * @param {} db 
   */
async function writeManifest(db, manifest_file_name, update) {
  var manifest = new sqlite3.Database(manifest_file_name);
  
  var tables = await((new Promise((resolve, reject) => {
    manifest.all("SELECT * FROM sqlite_master WHERE type='table'", async function(err, row) {
      if (err !== null) {
        reject(err);
        return;
      }
      resolve(row);  
    });
  })));
  
    // we are currently ignoring the issue of when a manifest file changes
    // right now we will overwrite existing items
  console.log("Writing manifest to Mongo");
  var result = await Promise.map(tables, async (table_name) => {
    return await sqliteToMongo(manifest, db, table_name.name, update);
  }, { concurrency: 4 });
  
  return result;
}
  
function sqliteToMongo(sqlite, db, table_name, update) {
  return new Promise((resolve, reject) => {
    console.log("Creating collection: ", table_name);
    db.createCollection(table_name).then((collection) => {
      var promises = [];
      sqlite.each(`SELECT * FROM ${ table_name }`, function(err, row) {
        if (err !== null) {
          reject(err);
          return;
        }
  
          // all of the manifest files have the same indeces
          // just spread across different collections
        collection.createIndex({ id: 1 }, { unique: true });
        collection.createIndex({ name: 1 });
        
        // sqlite returns the JSON object as a string, not an object
        // we have to parse it to get the actual object
        var data = JSON.parse(row.json);
        data['id'] = row['id'];
              
        promises.push(writeToMongo(collection, data, update));
      }, function() {
        Promise.all(promises).then(resolve).catch(reject);
      });
    }).catch(reject);
  });
}

async function writeToMongo(collection, data, update) {
  if (data['BungieNet.Engine.Contract.Destiny.World.Definitions.IDestinyDisplayDefinition.displayProperties'] !== undefined) {
    delete data['BungieNet.Engine.Contract.Destiny.World.Definitions.IDestinyDisplayDefinition.displayProperties'];
  }
  try {
    var r = await collection.update({ 'id': data.id }, data, { upsert: true });
  } catch (err) {
    console.log("Error writing data to collection: ", collection.collectionName, err.errmsg);
    throw err;
  }
  return r;
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


  MongoClient.connect(url, async function(err, db) {
    if (err) {
      throw err;
    }
    DB_CONNECTION = db;
    console.log("Database connected!");
    
    var result = await getManifest();
    console.log("Manifest written: ", result);
    await writeManifest(db, result.manifest_file_name, result.update);
    console.log("Manifest moved to Mongo");
    process.exit(0);
  });

}
