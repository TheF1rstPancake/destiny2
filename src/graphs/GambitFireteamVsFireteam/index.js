import React from 'react';
import BaseGraph from '../BaseGraph';
import { GambitPlayerPerTeamData } from '../../graph_data';

import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';

class GambitFireteamVsFireteam extends BaseGraph {
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
    var keys = Object.keys(this.state.data).sort().filter((k) => {
      var split = k.split(" ");
      return split[0] !== split[1];
    });
    var y = [];
    for (var k in keys) {
      y.push(this.state.data[keys[k]].wins);
    }
    return [{
      x: keys,
      y: y,
      type: 'bar'
    }];
  }

  createChart() {
    return <Plot
      data={this.state.chartData}
      layout={{
        autosize: true,
        xaxis: { title: 'Fireteam vs Fireteam', automargin: true },
        yaxis: { title: 'Win Rate' },
        margin: this.default_layout.margin
      }}
      useResizeHandler={true}
      className='plot-class'
      config={this.default_config}
    />;
  }
  render() {
    return <div id="GambitFireteamVsFireteamHistogram" className="graph">
      <h1><Link to="/graphs/gambit_fireteam_vs_fireteam">Gambit Fireteam vs Fireteam Win Rate</Link></h1>
      {
        this.state.chartData !== undefined ? this.createChart():null
      }
    </div>;
  }
}
export default GambitFireteamVsFireteam;