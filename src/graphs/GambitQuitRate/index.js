import React from 'react';
import BaseGraph from '../BaseGraph';
import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

class GambitFireteamQuitRate extends BaseGraph {
  constructor(props) {
    super(props);
    this.state = {};
    
    this.createChart = this.createChart.bind(this);
  }
 
  formatData(data) {
    var keys = Object.keys(data).sort();

    var y =[];
    for (var i in keys) {
      let k = keys[i];

      y.push(data[k].games_with_quitters/data[k].total_games);
    }
    return [{
      type: 'bar',
      x: keys,
      y: y
    }];
  }
  createChart() {
    return <Plot
      data={this.state.chartData}
      layout={{ 
        autosize: true,
        xaxis: { title: 'Fireteam Combination', automargin: true },
        yaxis: { title: 'Opposing Quit Rate',  },
        margin: this.default_layout.margin
      }}
      useResizeHandler={true}
      className="plot-class"
      config= {this.default_config}
    />;
  }
  render() {
    return <div id="GambitFireteamQuitRate" className="graph">
    <h1><Link to="/graphs/gambit_fireteam_quit_rate">Gambit Fireteam Quit Rate</Link></h1>
    {
      this.state.chartData !== undefined ? this.createChart():null
    }
  </div>;
  }
}

export default GambitFireteamQuitRate;

GambitFireteamQuitRate.defaultProps = {
  datafile: 'GambitQuitRatePerFireteam.json'
};

GambitFireteamQuitRate.propTypes ={
  datafile: PropTypes.string.isRequired
};