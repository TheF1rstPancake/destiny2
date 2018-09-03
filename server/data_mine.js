const mongodb = require("mongodb");

var modeHash = { 
  '0': 'None',
  '2': 'Story',
  '3': 'Strike',
  '4': 'Raid',
  '5': 'AllPvP',
  '6': 'Patrol',
  '7': 'AllPvE',
  '9': 'Reserved9',
  '10': 'Control',
  '11': 'Reserved11',
  '12': 'Clash',
  '13': 'Reserved13',
  '15': 'Reserved15',
  '16': 'Nightfall',
  '17': 'HeroicNightfall',
  '18': 'AllStrikes',
  '19': 'IronBanner',
  '20': 'Reserved20',
  '21': 'Reserved21',
  '22': 'Reserved22',
  '24': 'Reserved24',
  '25': 'Reserved25',
  '26': 'Reserved26',
  '27': 'Reserved27',
  '28': 'Reserved28',
  '29': 'Reserved29',
  '30': 'Reserved30',
  '31': 'Supremacy',
  '32': 'Reserved32',
  '37': 'Survival',
  '38': 'Countdown',
  '39': 'TrialsOfTheNine',
  '40': 'Social',
  '41': 'TrialsCountdown',
  '42': 'TrialsSurvival',
  '43': 'IronBannerControl',
  '44': 'IronBannerClash',
  '45': 'IronBannerSupremacy' 
};


var url = "mongodb://localhost:27017/mydb";
var MongoClient = mongodb.MongoClient;


/**
 * Return data from the datbase chunked by week
 * This will let us aggregate data on a week by week basis
 * And saves us from having to manage all records in memory at once
 * Instead, we are only operating on a small group at a time
 * 
 */
async function getGamesByWeek(collection) {
  var start_date = new Date("2017-09-08");
  var end_date = new Date(start_date.getTime() + (1000*60*60*24*7));
  var num_week = 1;
  // let the max date be a week from today
  // we could have dates that fall within the middle of the current week
  var max_date = new Date(new Date().getTime() + (1000*60*60*24*7));
  var return_value = [];
  while (end_date <= max_date) {
    var results = collection.find({ period: { $gte: start_date, $lt: end_date} });//.toArray();
    var payload = {
      week: {
        start: start_date, 
        end: end_date, 
        num: num_week
      }, 
      cursor: results
    };
    start_date = end_date;
    end_date = new Date(start_date.getTime() + (1000*60*60*24*7));
    num_week++;
    
    return_value.push(payload);
  }
  return return_value;
}

async function run(collection) {
  var quits = {};
  var weeks = await getGamesByWeek(collection);
  // process in parallel

  var promises = weeks.map(async function(week) {
    var q = await getQuitRate(week, collection);
    quits[week.week.num] = {...q, ...week.week};
  });

  await Promise.all(promises);
  console.log("QUITS: ", quits);
  return quits;
}

async function countByMode(collection) {
  var results = await collection.aggregate(
    [
      { 
        '$group': { 
          "_id": "$mode", "count": { "$sum": 1 } 
        }
      }
    ]
    ).toArray();
  
  await results.forEach(function(h, i) {
    results[i]['mode'] = modeHash[h['_id']];
  });
  console.log(results);
  return results;
}

async function getGamesPerDay(collection) {
  var results = await collection.find({}, { mode: 1, period: 1, id: 1 }).toArray();

  var days = {};
  await results.forEach(function(r, i) {
    //var r = results[i];
    var d = new Date(r.period);
    var date = `${ d.getUTCFullYear() }-${ d.getUTCMonth() + 1 }-${ d.getUTCDate() }`;
    if (days[date] === undefined) {
      days[date] = 1;
    } else {
      days[date] += 1;
    }
  });
   
  console.log(days);
}

async function groupByWeek(results) {
  this.day_one = new Date("2017-09-08");
  var weeks = {};
  await results.forEach(function(r) {
    var d = new Date(r.period);
    var week = Math.floor(((d - this.day_one)/1000/60/60/24/7)) + 1;
    if (weeks[week] === undefined) {
      weeks[week] = [];
    }
    weeks[week].push(r);
  });

  return weeks;
}

async function getQuitRate(week, collection) {
  var num_games = await week.cursor.count();
  var num_quits = await collection.find(
    { 
      period: {
       $gte: week.week.start.toISOString(), $lt: week.week.end.toISOString()
      },
      entries: {
        "$elemMatch": {"values.completed.basic.value":{ $ne: 1 } }
      }
    }
  ).count();
  
  return {num_games: num_games, quits: num_quits};
}

async function getQuitRateIterative(cursor) {
  this.day_one = new Date("2017-09-08");
  
  // every player is a different entry
  // we know a player quit by looking at the values.completed field
  // 0 means no, 1 means Yes
  // to start this function just returns how many games at least one user quits
  var num_games = await cursor.count();
  var quits = {};

  return new Promise((resolve, reject) => {
    cursor.forEach(function(r) {
      for (var i in r.entries) {
        // determine the week
        var d = new Date(r.period);
        var week = Math.floor(((d - this.day_one)/1000/60/60/24/7)) + 1;
        if(quits[week] === undefined) {
          quits[week] = {quits: 0, num_games: 0}
        }
        quits[week].num_games + 1;

        // check if the user quit
        var q = r.entries[i].values.completed.basic.value;
        if ( q !== 1) {
          quits[week].quits++;
          break;
        }
      }
      //console.log(r.id);
    }, function() {
      resolve(quits);
    });
  });
}

if (require.main === module) {
  MongoClient.connect(url, async function(err, db) {
    if (err) {
      throw err;
    }
    var collection = db.collection("PGCR");
    try {
      var success = await run(collection);
    } catch (err) {
      console.log("ERROR: ", err);
    }
    db.close();
    process.exit(0);
  });
}

module.exports = {
  getQuitRate: getQuitRate,
  groupByWeek: groupByWeek,
  getGamesByWeek: getGamesByWeek
};
  
