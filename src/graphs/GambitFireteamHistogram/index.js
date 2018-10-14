import React from 'react';
import BaseGraph from '../BaseGraph';
import { GambitWinRatePerFireteamData } from '../../graph_data';

import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';

class GambitFireteamHistogram extends BaseGraph {
  constructor(props) {
    super(props);
    this.state = {};

    this.createChart = this.createChart.bind(this);
  }
  componentDidMount() {
    this.setState({ 
      chartData: this.formatData(GambitWinRatePerFireteamData.data) 
    });
  }
  formatData(data) {
    var keys = Object.keys(data);
    keys.sort();
    var sorted = {};
    var y = [];
    for (var k in keys) {
      sorted[keys[k]] = data[keys[k]];
      y.push(sorted[keys[k]].ratio);
    }
    return [{
      x: Object.keys(sorted),
      y: y,
      type: 'bar'
    }];
  }

  createChart() {
    return <Plot
      data={this.state.chartData}
      layout={{ 
        autosize: true,
        margin: this.default_layout.margin,
        xaxis: { title: 'Fireteam Combination', automargin: true },
        yaxis: { title: 'Ratio' }
      }}
      useResizeHandler={true}
      className='plot-class'
      config={this.default_config}
    />;
  }
  render() {
    return <div id="GambitFireteamHistogram" className="graph">
      <h1><Link to="/graphs/gambit_fireteam_histogram">Gambit Fireteam Composition Histogram</Link></h1>
      {
        this.state.chartData !== undefined ? this.createChart():null
      }
    </div>;
  }
}
export default GambitFireteamHistogram;