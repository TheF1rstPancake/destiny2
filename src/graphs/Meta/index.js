
import React from 'react';
import BaseGraph from '../BaseGraph';
import { MetaData } from '../../graph_data';
import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';

class Meta extends BaseGraph {
  constructor() {
    super();
    this.state = {
      show_ratio: false
    };
  

    this.formatData = this.formatData.bind(this);
    this.createChart = this.createChart.bind(this);
    this.showRatio = this.showRatio.bind(this);

  }
  formatData(show_ratio) {
    show_ratio = show_ratio === undefined ? false : show_ratio;
    var x = Object.keys(MetaData.num_weeks);
    var y = null;
    if (show_ratio === false) {
      y = MetaData.num_weeks;
    } else {
      y = MetaData.num_weeks.map((w) => {
        return w/MetaData.total_weapons;
      });
    }
    var data = [{
      type: "bar",
      y: y,
      x: x
    }];
    return data;
  }

  componentDidMount() {
    this.setState({ chartData: this.formatData() });
  }

  createChart() {
    var chartData = this.state.chartData;
    chartData.type = "bar";
    chartData.name="Top Ten";
    return <Plot
      data={chartData}
      layout={{ autosize: true, }}
      useResizeHandler={true}
      className="plot-class"
    />;
  }
  showRatio() {
    var show = !this.state.show_ratio;
  
    this.setState({ 
      chartData: this.formatData(show),
      show_ratio: show
    });
  }

  render() {
    return this.state.chartData !== undefined ? 
    <div className="graph">
      <h1><Link to="/graphs/meta">Average Number of Weeks in Top Ten Used</Link></h1>
      <button onClick = {this.showRatio}>
        {this.state.show_ratio === true ? 'Show Total' : 'Show Ratio'}
      </button><br/>
      {this.createChart()}
    </div> : null;
  }
}

export default Meta;
