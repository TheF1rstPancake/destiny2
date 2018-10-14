const mongodb = require("mongodb");
var url = "mongodb://localhost:27017/mydb";
var MongoClient = mongodb.MongoClient;
var fs = require("fs");
 
async function gambitGamesPerWeek(collection) {
  var total_games_per_week = await(collection.aggregate([
    { $match: { "activityDetails.modes": 63 } }, 
    { $project: { id: 1, week: { $week: "$period" }, year: { $year: "$period" } } }, 
    { $group: { "_id": { week: "$week", "year": "$year" }, count: { $sum: 1 } } },
    { $project: { count: 1, date: { "year": "$_id.year", "week": "$_id.week" } } },
    { $out: "GambitGamesPerWeek" }]).toArray());
  return total_games_per_week;
}

/**
 * Measure how many times a particular fireteam composition is quit against
 * It also attempts to calculate how often that team wins in the event someone quits against them
 * @param {*} collection 
 */
async function quitRatePerFireteam(collection) {
  var pipeline = [
    {
      $match: { 
        mode: 63,
        "entries": { $not: { $elemMatch: { "values.standing.basic.displayValue": "Tie" } } },
        "entries": { $not: { $elemMatch: { "values.team.basic.value": -1 } } } 
      } 
    }, // find gambit matches
    {
      $unwind: "$entries"
    }, // unwind each player
    {
      $group: {
        _id: {
          gameId: "$id",
          teamId: "$entries.values.team.basic.value",
          fireteamId: "$entries.values.fireteamId.basic.value",
          standing: "$entries.standing"
        },
        num_players: {
          $sum: 1
        },
        num_completed: {
          $sum: "$entries.values.completed.basic.value"
        }
      }
    },
    {
      $group: { // group again to have game and team and a list of the number of players in each fireteam.  For example [3,1] or [1,1,1,1]
        _id: {
          gameId: "$_id.gameId",
          teamId: "$_id.teamId",
          standing: "$_id.standing"
        },
        num_completed: {
          $sum: "$num_completed"
        },
        players: {
          $push: "$num_players"
        },
        total_players: {
          $sum: "$num_players"
        }
      } 
    },
    { // get the number of people who quit rather than the number of people who stayed
      $project: {
        num_quitters: {
          $subtract: ["$total_players", "$num_completed"]
        },
        num_completed: 1,
        players: 1,
        total_players: 1
      } 
    },
    { 
      $group: {  // group one more time to get the structure we want
        _id: { gameId: "$_id.gameId" }, 
        total_players: { $sum: "$total_players" },
        teams: { $push: { team: "$_id.teamId", players: "$players", total_players: "$total_players", standing: "$_id.standing", num_quitters: "$num_quitters", num_completed: "$num_completed" } } 
      }
    }, 
  ];
  var results =  await collection.aggregate(pipeline).toArray();
  console.log("Total games: ", results.length);
  var output = {};
  for (var i in results) {
    var r = results[i];
    if (r.teams.length < 2) {
      continue;
    }
    var team_a = r.teams[0];
    var team_b = r.teams[1];
    var team_a_key = `[${ team_a.players.sort().join(",") }]`;
    var team_b_key = `[${ team_b.players.sort().join(",") }]`;
    console.log(team_a_key, team_b_key);

    // create structure for team A
    if (output[team_a_key] === undefined) {
      output[team_a_key] = {
        quits_against: 0,
        games_with_quitters: 0,
        total_games: 0,
        wins_when_other_team_quits: 0,
        wins: 0
      };
    }

    //create structure for team B
    if (output[team_b_key] === undefined) {
      output[team_b_key] = {
        quits_against: 0,
        games_with_quitters: 0,
        total_games: 0,
        wins_when_other_team_quits: 0,
        wins: 0
      };
    }
    // add one to the game count for both teams
    output[team_a_key].total_games += 1;
    output[team_b_key].total_games += 1;

    // check if anyone quit against team A or team B and tally accordingly
    // in each case see if the team that was _not_ quit against won the match and add 1 for that
    if (team_b.num_quitters > 0) {
      output[team_a_key].quits_against += team_b.num_quitters;
      output[team_a_key].games_with_quitters += 1;
      if (team_a.standing === 0) {
        output[team_a_key].wins_when_other_team_quits += 1;
      }
    }
    if (team_a.num_quitters > 0) {
      output[team_b_key].quits_against += team_a.num_quitters;
      output[team_b_key].games_with_quitters += 1;
      if (team_b.standing === 0) {
        output[team_b_key].wins_when_other_team_quits += 1;
      }
    }

    // tally wins in general
    if (team_a.standing === 0) {
      output[team_a_key].wins += 1;
    } else if (team_b.standing === 0) {
      output[team_b_key].wins += 1;
    }
  }
  return output;
}

/**
 * Calculate the average win rate per team/fireteam composition
 * INCLUDING instances where people quit
 * This is really just a rough average win rate based solely on how many fireteams a team is comprised of
 * @param {} collection 
 */
async function winRatePerFireteam(collection) {
  var pipeline = [
    { // find gambit matches and remove any match that ended in a TIE OR a match where a player had an invalid team value
      $match: { 
        mode: 63,
        "entries": { $not: { $elemMatch: { "values.standing.basic.displayValue": "Tie" } } },
        "entries": { $not: { $elemMatch: { "values.team.basic.value": -1 } } } 
      } 
    },   
    { $unwind: "$entries" },    // unwind each player
    
    { $group: { _id: { gameId: "$id", teamId: "$entries.values.team.basic.value", fireteamId: "$entries.values.fireteamId.basic.value", standing: { $min: "$entries.values.standing.basic.value" } }, num_players: { $sum: 1 } } },  //group by game and team to count the number of players in each fireteam (each fireteam is a different record after this)
    { $group: { _id: { gameId: "$_id.gameId", teamId: "$_id.teamId", standing: "$_id.standing" }, players: { $push: "$num_players" }, total_players: { $sum: "$num_players" } } }, // group again to have game and team and a list of the number of players in each fireteam.  For example [3,1] or [1,1,1,1]
    { 
      $group: { 
        _id: { "players": "$players", total_players: "$total_players" },
        loses: { $sum: "$_id.standing" },
        total_games: { $sum: 1 },
      }
    },
    {
      $project: {
        wins: { $subtract: ["$total_games", "$loses"] },
        loses: 1,
        total_games: 1
      }
    },
    {
      $project: {
        loses: 1,
        total_games: 1,
        wins: 1
      }
    }, 
    { // only take fteams that had 4 people in them.  Our ratios at the end of this may not add up correctly, but that's fine
      $match: {
        "_id.total_players": 4
      } 
    }
  ];
  var results = await collection.aggregate(pipeline).toArray();

  var total_gambit_games = await collection.find({ 
    mode: 63,
    "entries": { $not: { $elemMatch: { "values.standing.basic.displayValue": "Tie" } } },
    "entries": { $not: { $elemMatch: { "values.team.basic.value": -1 } } } 
  }).count();

  // this query treats [1,2,1] as different from [1,1,2]
  // we need to sort real fast to fix that
  var output = {};
  for (var i in results) {
    let r = results[i];

    let key = `[${ r._id.players.sort().join(",") }]`;
    if (output[key] === undefined) {
      output[key] = {
        loses: 0,
        wins: 0,
        total_games: 0
      };
    }
    output[key].loses += r.loses;
    output[key].wins += r.wins;
    output[key].total_games += r.total_games;
  }

  // pass through one more time to calculate ratios
  for (var i in output) {
    output[i].win_ratio = output[i].wins/output[i].total_games;
    output[i].ratio = output[i].total_games/total_gambit_games;
  }
  return output;

}

/**
 * Calculate the different combinations of complete fireteams
 * and their associated win rate when going against other different fireteam combos.
 * This IGNORES games where people may have quit.
 * @param {*} collection 
 */
async function playersPerTeam(collection) {
  var pipeline = [
    { $match: { //remove matches with invalid data AND remove matches where people quit
      mode: 63,
      "entries": { $not: { $elemMatch: { "values.standing.basic.displayValue": "Tie" } } },
      "entries": { $not: { $elemMatch: { "values.team.basic.value": -1 } } },
      "entries": { $not: { $elemMatch: {
        "values.completed.basic.value": 0
      } } } 
    } }, 
    { $unwind: "$entries" },    // unwind each player
    { 
      $group: { //group by game and team to count the number of players in each fireteam (each fireteam is a different record after this)
        _id: { 
          gameId: "$id", 
          teamId: "$entries.values.team.basic.value", 
          fireteamId: "$entries.values.fireteamId.basic.value", 
          standing: { $min: "$entries.values.standing.basic.value" } 
        }, 
        num_players: { $sum: 1 } 
      } 
    },  
    { $group: { _id: { gameId: "$_id.gameId", teamId: "$_id.teamId", standing: "$_id.standing" }, players: { $push: "$num_players" }, total_players: { $sum: "$num_players" } } }, // group again to have game and team and a list of the number of players in each fireteam.  For example [3,1] or [1,1,1,1]
    { 
      $group: {  // group one more time to get the structure we want
        _id: { gameId: "$_id.gameId" }, 
        total_players: { $sum: "$total_players" },
        teams: { $push: { team: "$_id.teamId", players: "$players", total_players: "$total_players", standing: "$_id.standing" } } 
      }
    }, 
    {
      $match: { // only look at games that had at least 8 people
        total_players: 8,
      } 
    }
  ];
  var results = await collection.aggregate(pipeline).toArray();
  var data = {};
  for (var i in results) {
    var d = results[i];
   
    // sometimes a game is logged even though there weren't enough teams for the game to start
    // skip these
    if (d.teams.length !== 2) {
      continue;
    }
    var team_a = d.teams[0];
    var team_b = d.teams[1];


    // sort the teams so that items are easier to compare
    // this allows us to quickly identify that "[3,1]"
    // is the same as "[1,3]"
    var a = team_a.players.sort().join(",");
    var b = team_b.players.sort().join(",");

    // [1,1,1,1] vs [1,1,2] === [1,1,2] vs [1,1,1,1]
    // [1,1,2] vs [4] === [4] vs [1,1,2]
    // [1,3] vs [2,2] === [2,2] vs [1,3]
    // so we are going to come up with an odd rule for how we want to hash these
    // the list with the shorter length is always first
    // if two lists have the same length, then the one with the highest max goes first
    // whichever key comes first will also be what we use to check for win ratios
    // so in [1,1,2] v [4] bucket, we will add 1 to the `wins` bucket IF the [1,1,2] team was victorious
    var key_1 = null;
    var key_2 = null;
    var winning_team_check = null;
    if (a.length > b.length) {
      key_1 = a;
      key_2 = b;
      winning_team_check = team_a;
    } else if (a.length < b.length) {
      key_1 = b;
      key_2 = a;
      winning_team_check = team_b;
    } else {
      if (a[-1] >= b[-1]) {
        key_1 = a;
        key_2 = b;
        winning_team_check = team_a;
      } else {
        key_1 = b;
        key_2 = a;
        winning_team_check = team_b;
      }
    }

    // create the count for the histogram
    var key = `[${ key_1 }] [${ key_2 }]`;
    if (data[key] === undefined ) {
      data[key] = { count: 0, wins: 0 };
    }
    data[key].count += 1;
    
    // check the winning team's standing and add one
    // Victory is represented with a 0 in the API
    if (winning_team_check.standing === 0) {
      data[key].wins +=1;
    }
  }
  return data;
}

async function describe(collection, extended) {
  var group = {};
  var desc = {};
  var project = {};
  
  // build our group by based on the fields in the extended paramater
  // those fields should be valid fields in the "entries.extended.values"
  // element in the gambit documents
  for (var i in extended) {
    var f = extended[i];

    // do a sumation for the field to get the total amount
    group[f] = {
      $sum: `\$entries.extended.values.${ f }.basic.value`
    };

    // calculate the varies states
    var path = `\$${ f }`;
    desc[`${ f }_avg`] = {
      $avg: path
    };
    desc[`${ f }_min`] = {
      $min: path
    };
    desc[`${ f }_max`] = {
      $max: path
    };
    desc[`${ f }_std`] = {
      $stdDevPop: path
    };

    // reshape the output
    project[f] = {
      'avg': `\$${ f }_avg`,
      'min': `\$${ f }_min`,
      'max': `\$${ f }_max`,
      'std': `\$${ f }_std`
    };
  }

  group._id = {
    instanceId: "$id",
    teamId: "$entries.values.team.basic.value"
  };
  desc._id = null;

  var pipeline = [
    {
      $match: {
        "activityDetails.mode": 63
      }
    },
    {
      $unwind: "$entries"
    },
    {
      $group: group
    }, {
      $group: desc
    }, { $project: project }
  ];
  console.log("Using pipeline: ", JSON.stringify(pipeline, null, 2));

  return new Promise((resolve, reject) => {
    collection.aggregate(pipeline, function(err, result) {
      if (err !== null) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

async function weaponUsage(collection) {
  var pipeline = [
    { $match: { "activityDetails.modes": 63 } }, 
    { $unwind: "$entries" }, 
    { $unwind: "$entries.extended.weapons" }, 
    { $project: { "id": 1, "entries.extended.weapons": 1, week: { $week: "$period" }, year: { $year: "$period" } } }, 
    { $group: { 
      "_id": { 
        "referenceId": "$entries.extended.weapons.referenceId", "week": "$week", "year": "$year" 
      }, 
      "games": { $addToSet: "$id" } 
    } }, 
    { $project: { num_games: { $size: "$games" }, date: { "year": "$_id.year", "week": "$_id.week" } } },
    { 
      $lookup: {
        from: "DestinyInventoryItemDefinition",
        localField: "_id.referenceId",
        foreignField: "hash",
        as: "itemDetails"
      }
    }, 
    {
      $project: {
        num_games: 1, 
        date: 1,
        name: { $arrayElemAt: ["$itemDetails.displayProperties.name", 0] }
      }
    },
    { 
      $lookup: {
        from: "GambitGamesPerWeek",
        localField: "date",
        foreignField: "date",
        as: "gamesPerWeek"
      }
    },
    {
      $project: {
        data: {
          referenceId: "$_id.referenceId", 
          num_games: "$num_games", 
          name: "$name", 
          ratio: { $divide: ["$num_games", { $arrayElemAt: ["$gamesPerWeek.count", 0] }] }
        }
      }
    }, {
      $sort: {
        "_id.year": 1,
        "_id.week": 1,
        "data.ratio": -1
      }
    },
    { 
      $out: "GambitWeaponsPerWeek"
    }
  ];

  var results = await (collection.aggregate(pipeline).toArray());
  return results;
}


MongoClient.connect(url, async function(err, db) {
  if (err) {
    throw err;
  }
  console.log("Database connected!");
  var collection = db.collection("PGCR");

  //var r = await gambitGamesPerWeek(collection);
  //console.log("Games per week: ", r);

  //r = await weaponUsage(collection);
  //console.log("Sleeper: ", JSON.stringify(r, null, 2));
  // get the mean, min, max and standard dev of different attributes
  //var d = await describe(collection, ['motesLost', 'motesDeposited', 'motesDenied', 'motesDegraded', 'smallBlockersSent', 'mediumBlockersSent', 'largeBlockersSent', 'invasions', 'invasionKills']);
  var playerBreakdown = await playersPerTeam(collection);
  var sum = 0;
  for (var i in playerBreakdown) {
    sum+=playerBreakdown[i].count;
  }
  console.log("Total number of games: ", sum);  
  // sort the output
  var k = Object.keys(playerBreakdown).sort();
  var final = {};
  for (var i in k) {
    final[k[i]] =  { count: playerBreakdown[k[i]].count/sum, wins: playerBreakdown[k[i]].wins/playerBreakdown[k[i]].count };
  }
  console.log("Team Composition Histogram: ", final);
  fs.writeFileSync("./src/graph_data/GambitPlayersPerTeam/index.js", `module.exports = ${ JSON.stringify({ data: final }, null, 2) }`);

  
  // calculate win rate
  var winRate = await winRatePerFireteam(collection);
  console.log("Win rate per team composition: ", JSON.stringify(winRate, null, 2));
  fs.writeFileSync("./src/graph_data/GambitWinRatePerFireteam/index.js", `module.exports = ${ JSON.stringify({ data: winRate }, null, 2) }`);


  // calculate quit rate and impact 
  var quitRate = await quitRatePerFireteam(collection);
  var keys = Object.keys(quitRate);
  console.log("Filtering: ", keys.length);
  keys = keys.filter((quitRate) => {
    // strip the brackets from the key
    quitRate = quitRate.replace('[', '').replace(']', '');
    var num_players = quitRate.split(",")
      .map((c) => Number.parseInt(c))
      .reduce((x, y) => {return x+y;});
    if (num_players === 4) {
      return true;
    }
  });
  var final = {};
  console.log("Finished filter: ", keys.length);
  for (var i in keys) {
    final[keys[i]] = quitRate[keys[i]];
    final[keys[i]].wins_when_quits_ratio = quitRate[keys[i]].wins_when_other_team_quits / quitRate[keys[i]].games_with_quitters;
    final[keys[i]].overall_win_ratio = quitRate[keys[i]].wins / quitRate[keys[i]].total_games;

    var games_without_quitters = quitRate[keys[i]].total_games - quitRate[keys[i]].games_with_quitters;
    var wins_without_quitters = quitRate[keys[i]].wins - quitRate[keys[i]].wins_when_other_team_quits;

    final[keys[i]].wins_without_quits_ratio = wins_without_quitters / games_without_quitters; 
  }
  console.log(JSON.stringify(final, null, 2));
  fs.writeFileSync("./src/graph_data/GambitQuitRatePerFireteam/index.js", `module.exports = ${ JSON.stringify({ data: final }, null, 2) }`);

  process.exit(0);
});