var express = require('express');
var router = express.Router();
var database = require("../database");
var data_mine = require("../data_mine");


router.get('/message', function(req, res, next) {
  res.json('Welcome To React');
});

router.get("/weekly", async function(req, res, next) {
  var db = await database.get();
  var collection = db.collection("PGCR");
  
  // group by week
  var results = {};
  var weeks = await data_mine.getGamesByWeek(collection);

  // process in parallel
  var promises = weeks.map(async function(week) {
    var q = await data_mine.getQuitRate(week, collection);
    results[week.week.num] = {...q, ...week.week};
  });

  await Promise.all(promises);
  console.log("QUITS: ", results);

  res.json(results);
});

module.exports = router;
