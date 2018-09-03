const mongodb = require("mongodb");
var { TopTenWeaponsData } = require("../src/graph_data");

var url = "mongodb://localhost:27017/mydb";
var MongoClient = mongodb.MongoClient;
var fs = require("fs");

function getDateFromYearAndWeek(y, w) {
  var simple = new Date(y, 0, 1 + (w - 1) * 7);
  var dow = simple.getDay();
  var ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
}

function aggregateWeapons(collection) {
  return new Promise((resolve, reject) => {
    collection.aggregate([
      { $unwind: "$weapons" }, 
      { 
        $project: {
          _id: { referenceId: "$weapons.referenceId", name: "$weapons.name" }, 
          "ratio": "$weapons.ratio", date: "$_id" } 
      }, 
      { 
        $group: { 
          _id: "$_id", 
          data: { $push: { ratio: "$ratio", date: "$date" } } 
        }
      },
      {
        $match: {
          "data.ratio": { $gte: .10 }
        }
      }
    ], function(err, result) {
      if (err !== null) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

/**
 * We spent a good amount of time on this, but it didn't lead
 * where we thought it would.  This finds a weapon's "growth" period
 * and does some aggregation and filtering based on that
 * @param {} weapons 
 */
function consecutiveGrowthWeeks(weapons) {
  weapons = weapons.map((weapon) => {
    var growth_weeks = [];

    // let's just find all of the growth weeks
    // a "growth week" is a week where we see a jump in usage
    // over the previous week
    // there are some weeks where we are missing data about a given weapon
    // so we will use the last known data point as an estimate
    // we are also going to ignore any weapon that has less than 4% in a given week.
    for (var i = 0; i < weapon.data.length; i++) {
      var f = weapon.data[i];
      var b = i-1 < 0 ? { ratio: 0 } : weapon.data[i - 1];
      if (f.ratio >= .1 && f.ratio > b.ratio) {
        var d = weapon.data[i].date;
        d.index = i;
        growth_weeks.push(d);
      }
    }

    weapon.growth_weeks = growth_weeks;
    return weapon;
  });


  // filter for only the weapons that have experienced more than X number of growth weeks
  var GROWTH = 3;
  var GROWTH_RATE = .3;

  weapons = weapons.filter((weapon) => {
    // first, let's see if the weapon even has more than 2
    // growth weeks.  If it does not, then return null
    if (weapon.growth_weeks.length < GROWTH) {
      return null;
    }

    // the first week in the array is always a growth week
    // we then want to iterate through the list of weeks
    // and look _backwards_ to see if the list is consecutive
    // we will use the consecutive array to keep track of the indeces of consecutive growth
    
    var consecutive = [0];
    console.log("FIRST: ", weapon._id, getDateFromYearAndWeek(weapon.growth_weeks[0].year, weapon.growth_weeks[0].week));
    for (var i = 1; i < weapon.growth_weeks.length; i++) {

      var end_date = getDateFromYearAndWeek(weapon.growth_weeks[i].year, weapon.growth_weeks[i].week);
      var start_date = getDateFromYearAndWeek(weapon.growth_weeks[i-1].year, weapon.growth_weeks[i-1].week);
      if (Math.floor( (end_date-start_date)/1000/60/60/24) === 7) {        
        consecutive.push(weapon.growth_weeks[i].index);   
        console.log("Found consec: ", weapon._id, end_date, start_date, consecutive.length);

      } else {
        // once we no longer have a consecutive week of growth
        // check to see if we reached our limit.  If we did, return the weapon
        // if not, reset the consecutive tracker
        if (consecutive.length >= GROWTH) {
          weapon.consecutive_growth = consecutive;
          return weapon;
        }
        consecutive = [weapon.growth_weeks[i].index];
      }
    }
    // check one more time to make sure we've accurately captured growth
    if (consecutive.length >= GROWTH) {
      weapon.consecutive_growth = consecutive;
      return weapon;
    }

    console.log("-------------------------");
  });
  console.log("Num weapons: ", weapons.length);
  
  var top_ten = {};
  for (var i = 0; i < TopTenWeaponsData.data.length; i++) {
    var w = TopTenWeaponsData.data[i];
    top_ten[w._id.referenceId] = {
      name: w._id.name,
      num_weeks: w.data.length
    };
  }
  // now we have all weapons that have experienced some sort of growth period AND have at some point in their lifetime peeked over the 10% barrier
  // Next, we want to calculate the difference in ratios at the bottom and top of the growth curve
  var growth_weapons = weapons.map((weapon) => {
    var first = weapon.consecutive_growth[0];
    var last = weapon.consecutive_growth[weapon.consecutive_growth.length-1];
    
    var difference = weapon.data[last].ratio;

    var num_weeks = top_ten[weapon._id.referenceId] !== undefined ? top_ten[weapon._id.referenceId].num_weeks : 0;

    return {
      _id: weapon._id,
      data: { 
        growth: difference, 
        num_weeks: num_weeks
      }
    };
  });
  return growth_weeks;

}

MongoClient.connect(url, async function(err, db) {
  if (err) {
    throw err;
  }
  console.log("Database connected!");

  var weapons_per_week = db.collection("WeaponKillsPerWeek"); 

  console.log("Aggregating data");
  var weapons = await aggregateWeapons(weapons_per_week);

  console.log("Filtering data for: ", weapons.length);
  var weapons = weapons.map((weapon) => {
    weapon.data.sort(function(a, b) {
      if (a.date.year < b.date.year) {
        return -1;
      } else if (a.date.year === b.date.year) {
        if (a.date.week < b.date.week) {
          return -1;
        } else {
          return 1;
        }
      } else {
        return 1;
      }
    });
    return weapon;
  });
  console.log("Analyzing");

  // new theory (this is attempt 17)
  // we are trying to hard to force a conclusion
  // instead, let's just throw the analytics out there
  //  1) how often does a gun remain in the top ten (bar)
  //  2) average percentage of a top ten during each week (line)

  var top_ten = TopTenWeaponsData.data.map((w) => {
    return {
      name: w._id.name,
      num_weeks: w.data.length
    };
  });

  var top_ten_num_weeks = [];
  for (var i= 0; i < top_ten.length; i++) {
    if (top_ten_num_weeks[top_ten[i].num_weeks] === undefined) {
      top_ten_num_weeks[top_ten[i].num_weeks] = 0; 
    }
    top_ten_num_weeks[top_ten[i].num_weeks] += 1;
  }

  var top_ten_average = [];
  for (var j = 0; j < TopTenWeaponsData.data.length; j++) {
    var w = TopTenWeaponsData.data[j];
    for (var i= 0; i < w.data.length; i++) {
      if (top_ten_average[i] === undefined) {
        top_ten_average[i] = {
          num_weapons: 0,
          average: w.data[i].ratio,
        };
      }
      top_ten_average[i].average = (top_ten_average[i].average + w.data[i].ratio)/2;
      top_ten_average[i].num_weapons += 1;
    }
  }



  fs.writeFileSync("src/graph_data/Meta/index.js", `module.exports = ${ JSON.stringify({ num_weeks: top_ten_num_weeks, total_weapons: top_ten.length, averages: top_ten_average }) }`);

  process.exit(0);
  
});