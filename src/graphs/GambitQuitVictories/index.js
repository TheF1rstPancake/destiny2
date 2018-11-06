import React from 'react';
import BaseGraph from '../BaseGraph';

import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

class GambitQuitVictories extends BaseGraph {
  constructor(props) {
    super(props);
    this.state = {};
    
    this.createChart = this.createChart.bind(this);
  }
  
  formatData(data) {
    var keys = Object.keys(data).sort();

    var win_ratios =[];
    var overall_ratios = [];
    var wins_without_quits = [];
    for (var i in keys) {
      let k = keys[i];

      win_ratios.push(data[k].wins_when_quits_ratio);
      overall_ratios.push(data[k].overall_win_ratio);
      wins_without_quits.push(data[k].wins_without_quits_ratio);
    }
    return [ {
      type: 'bar',
      x: keys,
      y: wins_without_quits,
      name: "No Quits"
    }, {
      type: 'bar',
      x: keys,
      y: overall_ratios,
      name: 'Overal Win'
    }, {
      type: 'bar',
      x: keys,
      y: win_ratios,
      name: "Opposing Quits"
    }];
  }
  createChart() {
    return <Plot
      data={this.state.chartData}
      layout={{ 
        autosize: true, 
        legend: { orientation: 'h', yanchor: 'top', y: 1.25 },
        xaxis: { title: 'Fireteam Combination', automargin: true },
        yaxis: { title: 'Ratio' },
        margin: this.default_layout.margin
      }}
      useResizeHandler={true}
      className="plot-class"
      config= {this.default_config}
    />;
  }
  render() {
    return <div id="GambitFireteamQuitRateVictories" className="graph">
    <h1><Link to="/graphs/gambit_quit_victories">Gambit Fireteam Win Rates</Link></h1>
    {
      this.state.chartData !== undefined ? this.createChart():null
    }
  </div>;
  }
}

export default GambitQuitVictories;

GambitQuitVictories.defaultProps = {
  datafile: 'GambitQuitRatePerFireteam.json'
};

GambitQuitVictories.propTypes ={
  datafile: PropTypes.string.isRequired
};