const utilities = require("./utilities");

async function run(db) {
  console.log("Database connected!");

  var collection = db.collection("PGCR");

  console.log("Total games per week");
  /*var total_games_per_week = await(collection.aggregate([
    { $match: { "activityDetails.modes": 5 } }, 
    { $project: { id: 1, week: { $week: "$period" }, year: { $year: "$period" } } }, 
    { $group: { "_id": { week: "$week", "year": "$year" }, count: { $sum: 1 } } },
    { $project: { count: 1, date: { "year": "$_id.year", "week": "$_id.week" } } },
    { $out: "GamesPerWeek" }]).toArray());
  console.log("Total games per week: ", total_games_per_week);

  var now = new Date();
  console.log("Starting kills per week: ", now);
  var kills_per_week = await (collection.aggregate(
    [
      { $match: { "activityDetails.modes": 5 } }, 
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
          from: "GamesPerWeek",
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
        $group: {
          _id: { week: "$_id.week", year: "$_id.year" },
          weapons: { $push: "$data" }
        }
      },
      { $out: "WeaponKillsPerWeek" }
    ]).toArray());
  var toc = new Date();
  console.log("Finished WeaponKillsPerWeek: ", ((toc - now)/1000));*/
 
  var weapons_per_week = db.collection("WeaponKillsPerWeek"); 
  console.log("Getting top 10");
  var top_ten = await (weapons_per_week.aggregate([
    { $project: { weapons: { $slice: ["$weapons", 10] } } }, 
    { $unwind: "$weapons" }, 
    { $project: { _id: { referenceId: "$weapons.referenceId", name: "$weapons.name" }, "ratio": "$weapons.ratio", date: "$_id" } }, 
    { $group: { _id: "$_id", data: { $push: { ratio: "$ratio", date: "$date" } } } 
    }]).toArray());
  var top_ten = { data: top_ten };
  await utilities.writeFile("TopTenWeapons.json", top_ten);

}

if (require.main === module) {
  utilities.runScript(run);
}