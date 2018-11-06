
import TopTenWeapons from './TopTenWeapons';
import Meta from './Meta';
import MetaAverages from './MetaAverage';
import WeaponKillsHistogram from './WeaponKillsHistogram';
import GambitFireteamHistogram from './GambitFireteamHistogram';
import GambitFireteamVsFireteam from './GambitFireteamVsFireteam';
import GambitFireteamVsFireteamHistogram from './GambitFireteamVsFireteamHistogram';
import GambitQuitRate from './GambitQuitRate';
import GambitQuitVictories from './GambitQuitVictories';
import GambitFireteamVsFireteamWithQuitters from './GambitFireteamvsFireteamWithQuitters';
import GambitFireteamWinRate from './GambitFireteamWinRate';

import { Route, Switch } from "react-router-dom";
import React, { Component } from 'react';


class Graphs extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className="graphs-container">
      <Switch>
        <Route path={`${ this.props.match.url }/toptenweapons`} component={TopTenWeapons}/>
        <Route path={`${ this.props.match.url }/meta`} component={Meta}/>
        <Route path={`${ this.props.match.url }/weaponusagehist`} component={WeaponKillsHistogram}/>
        <Route path={`${ this.props.match.url }/metaaverages`} component={MetaAverages}/>
        <Route path={`${ this.props.match.url }/gambit_fireteam_histogram`} component={GambitFireteamHistogram}/>
        <Route path={`${ this.props.match.url }/gambit_fireteam_vs_fireteam`} component={GambitFireteamVsFireteam}/>
        <Route path={`${ this.props.match.url }/gambit_fireteam_vs_fireteam_histogram`} component={GambitFireteamVsFireteamHistogram}/>
        <Route path={`${ this.props.match.url }/gambit_fireteam_quit_rate`} component={GambitQuitRate}/>
        <Route path={`${ this.props.match.url }/gambit_quit_victories`} component={GambitQuitVictories}/>
        <Route path={`${ this.props.match.url }/gambit_fireteam_vs_fireteam_with_quitters`} component={GambitFireteamVsFireteamWithQuitters}/>
        <Route path={`${ this.props.match.url }/gambit_fireteam_win_rate`} component={GambitFireteamWinRate}/>
      </Switch>
    </div>;
  }
}
export default Graphs;