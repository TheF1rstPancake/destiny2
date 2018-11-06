import React from 'react';
import BaseGraph from '../BaseGraph';

import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

class GambitFireteamVsFireteamWithQuitters extends BaseGraph {
  constructor(props) {
    super(props);
    this.state = {
      groupData: false
    };

    this.createChart = this.createChart.bind(this);
    this.formatData = this.formatData.bind(this);
  }

  componentDidMount() {
    Promise.all([
      axios.get(`${ this.graph_data_location }/GambitPlayersPerTeam.json`),
      axios.get(`${ this.graph_data_location }/GambitPlayersPerTeam_withQuitters.json`)
    ]).then((res) => {
      var data = res.map((i, idx) => {
        var name = idx === 0 ? 'Without quitters' : 'With quitters';
        return { name: name, data: i.data };
      });
      this.setState({
        chartData: this.formatData(data)
      });
    });
  }

  formatData(data) {
    var final_data = [];
    for (var i in data) {
      var d = data[i].data;
      var keys = Object.keys(d).sort().filter((k) => {
        var split = k.split(" ");
        return split[0] !== split[1];
      });
      var y = [];
      for (var k in keys) {
        y.push(d[keys[k]].wins);
      }
      final_data.push({
        name: data[i].name,
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

GambitFireteamVsFireteamWithQuitters.defaultProps = {
  datafile: 'GambitPlayersPerTeam.json'
};

GambitFireteamVsFireteamWithQuitters.propTypes ={
  datafile: PropTypes.string.isRequired
};