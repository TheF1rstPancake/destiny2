import React from 'react';
import BaseGraph from '../BaseGraph';
import { GambitPlayerPerTeamData } from '../../graph_data';

import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';

class GambitFireteamVsFireteamHistogram extends BaseGraph {
  constructor(props) {
    super(props);
    this.state = {
      data: GambitPlayerPerTeamData.data,
      groupData: false
    };

    this.createChart = this.createChart.bind(this);
    this.formatData = this.formatData.bind(this);
    
  }
  componentDidMount() {
    this.setState({ 
      chartData: this.formatData(this.state.data) 
    });
  }
  formatData() {
    var keys = Object.keys(this.state.data);
    keys.sort();
    var sorted = {};
    var y = [];
    for (var k in keys) {
      sorted[keys[k]] = this.state.data[keys[k]];
      y.push(sorted[keys[k]].count);
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
        xaxis: { tickangle: 45, automargin: true, title: 'Fireteam vs Fireteam'  },
        yaxis: { title: 'Ratio' },
        margin: this.default_layout.margin
      }}
      useResizeHandler={true}
      className='plot-class'
      config={this.default_config}
    />;
  }
  render() {
    return <div id="GambitFireteamVsFireteamHistogram" className="graph">
      <h1><Link to="/graphs/gambit_fireteam_vs_fireteam_histogram">Gambit Fireteam vs Fireteam Histogram</Link></h1>
      {
        this.state.chartData !== undefined ? this.createChart():null
      }
    </div>;
  }
}
export default GambitFireteamVsFireteamHistogram;