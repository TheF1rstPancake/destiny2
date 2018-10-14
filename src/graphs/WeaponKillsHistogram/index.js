import React from 'react';
import BaseGraph from '../BaseGraph';
import { WeaponHistogramData } from '../../graph_data';
import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';

class WeaponKillsHistogram extends BaseGraph {
  constructor() {
    super();
    
    this.state = {};
   
    this.formatData = this.formatData.bind(this);
    this.createChart = this.createChart.bind(this);

    // format the data
    this.state.chartData = this.formatData(WeaponHistogramData.data);
  }
  formatData(data) {
    var x = data.map(function(w) {
      return `[${ w.low.toPrecision(2) }, ${ w.high.toPrecision(2) })`;
    });
    var y = data.map(function(w) {
      return w.num_elements;
    });
    return [{
      x: x,
      y: y,
      type: "bar"
    }];
  }

  componentDidMount() {

  }

  createChart() {
    var chartData = this.state.chartData;
    //chartData.type = "histogram";
    chartData.name="Top Ten";
    return <Plot
      data={chartData}
      layout={{ autosize: true, margin: this.default_layout.margin, xaxis: { automargin: true } }}
      useResizeHandler={true}
      className="plot-class"
      config={this.default_config}
    />;
  }

  render() {
    return <div className="graph">
      <h1>
        <Link to="/graphs/weaponusagehist">
          Histogram of Weapon Usage
        </Link>
      </h1>
      {
        this.state.chartData !== undefined ? this.createChart():null
      }
    </div>;
  }
}

export default WeaponKillsHistogram;
