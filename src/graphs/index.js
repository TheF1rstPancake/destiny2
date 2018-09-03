
import TopTenWeapons from './TopTenWeapons';
import Meta from './Meta';
import MetaAverages from './MetaAverage';
import WeaponKillsHistogram from './WeaponKillsHistogram';

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

      </Switch>
    </div>;
  }
}
export default Graphs;