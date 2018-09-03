const mongodb = require("mongodb");
const fs = require("fs");

var url = "mongodb://localhost:27017/mydb";
var MongoClient = mongodb.MongoClient;


function histogram(data, num_bins) {
  num_bins = num_bins === undefined ? 20 : num_bins;
  var interval = 1/num_bins;

  var bins = [];
  for (var n = 0; n < num_bins; n++) {
    bins.push({
      low: n*interval,
      high: (n+1) * interval,
      num_elements: 0
    });
  }

  // our histogram will be left side inclusive
  for (var i = 0; i < data.length; i++) {
    var d = data[i].ratio;
    for (var j = 0; j < num_bins; j++) {
      if (d >= bins[j]["low"] && d < bins[j]["high"]) {
        bins[j].num_elements++;
      }
    }
  }
  return bins;
}

MongoClient.connect(url, async function(err, db) {
  var collection = db.collection("WeaponKillsPerWeek");

  var data = collection.find({}, { "weapons.ratio": 1 });
  var hists = await(data.map((d) => {
    return { id: d._id, data: histogram(d.weapons, 20) };
  }).toArray());

  
  // average the histograms by taking the average of each bucket
  // each histogram has the same number of buckets
  var average_hist = [];
  var num_bins = hists[0].data.length;
  var num_hists = hists.length;
  for (var b = 0; b < num_bins; b++) {
    var avg = 0;
    for (var h = 0; h < num_hists; h++) {
      avg += hists[h].data[b].num_elements;
    }
    average_hist.push({
      low: hists[0].data[b].low,
      high: hists[0].data[b].high,
      num_elements: Math.floor(avg / hists[0].data.length)
    });
  }
  console.log(average_hist);

  // final output should be the lowest percent usage a weapon
  // has to have in order to make it into the top 10
  // this result is emperical and may not be true for each
  // individual week
  var sum = 0;
  for (var b = average_hist.length-1; b >=0; b--) {
    sum += average_hist[b].num_elements;
    
    if (sum >= 10) {
      console.log("Lowest possible: ", average_hist[b].low);
      break;
    }
  }
  fs.writeFileSync("./src/graph_data/WeaponHistogram/index.js", `module.exports={data:${ JSON.stringify(average_hist) }}`);
  process.exit(0);
});