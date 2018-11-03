import React from 'react';
import BaseGraph from '../BaseGraph';
import { GambitPlayersPerTeamQuittersData } from '../../graph_data';
import { GambitPlayerPerTeamData } from '../../graph_data';

import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';

class GambitFireteamVsFireteamWithQuitters extends BaseGraph {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        with_quitters: GambitPlayersPerTeamQuittersData.data,
        without_quitters: GambitPlayerPerTeamData.data
      },
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
    var final_data = [];
    console.log(this.state.data);
    for (var i in this.state.data) {
      var d = this.state.data[i];
      var keys = Object.keys(d).sort().filter((k) => {
        var split = k.split(" ");
        return split[0] !== split[1];
      });
      var y = [];
      for (var k in keys) {
        y.push(d[keys[k]].wins);
      }
      final_data.push({
        name: i,
        x: keys,
        y: y,
        type: 'bar'
      });
    }
    return final_data;
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
      <h1><Link to="/graphs/gambit_fireteam_vs_fireteam_with_quitters">Gambit Fireteam vs Fireteam (with Quitters) Win Rate</Link></h1>
      {
        this.state.chartData !== undefined ? this.createChart():null
      }
    </div>;
  }
}
export default GambitFireteamVsFireteamWithQuitters;