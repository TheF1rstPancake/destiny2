var TopTenWeapons = require('./TopTenWeapons');
var Meta = require('./Meta');
var WeaponHistogram = require('./WeaponHistogram');
var GambitWinRatePerFireteam = require('./GambitWinRatePerFireteam');
var GambitPlayerPerTeam = require('./GambitPlayersPerTeam');
var GambitQuitRatePerTeam = require('./GambitQuitRatePerFireteam');
var GambitPlayersPerTeamQuitters = require('./GambitPlayersPerTeam_withQuitters');
module.exports = {
  TopTenWeaponsData: TopTenWeapons,
  MetaData: Meta,
  WeaponHistogramData: WeaponHistogram,
  GambitWinRatePerFireteamData: GambitWinRatePerFireteam,
  GambitPlayerPerTeamData: GambitPlayerPerTeam,
  GambitQuitRatePerTeamData: GambitQuitRatePerTeam,
  GambitPlayersPerTeamQuittersData: GambitPlayersPerTeamQuitters
};