
import React from 'react';
import BaseGraph from '../BaseGraph';
import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

class Meta extends BaseGraph {
  constructor() {
    super();
    this.state = {
      show_ratio: false
    };
  
    this.formatData = this.formatData.bind(this);
    this.createChart = this.createChart.bind(this);
  }
  formatData(data) {
    //show_ratio = show_ratio === undefined ? false : show_ratio;
    console.log("RAW DATA: ", data);
    var x = Object.keys(data.num_weeks);
    var y = Object.values(data.num_weeks);
    this.data = {
      raw: y,
      ratios: data.num_weeks.map((w) => {
        return w/data.total_weapons;
      })
    };

    var data = [{
      type: "bar",
      y: y,
      x: x
    }];
    console.log("FINAL DATA: ", data);
    return data;
  }

  createChart() {
    console.log("CREATING CHART: ");
    var chartData = this.state.chartData;
    return <Plot
      data={chartData}
      layout={{ 
        autosize: true, 
        margin: this.default_layout.margin,
        updatemenus: [
          {
            buttons: [
              {
                args: [
                  { y: [this.data.raw] }
                ],
                label: 'Default',
                method: 'update'
              },
              {
                args: [
                  { y: [this.data.ratios] },
                ],
                label: 'Ratios',
                method: 'update'
              }
            ],
            type: 'buttons',
            showactive: true
          }
        ]
      }}
      config={this.default_config}
      useResizeHandler={true}
      className="plot-class"
    />;
  }
  

  render() {
    return this.state.chartData !== undefined ? 
    <div className="graph">
      <h1><Link to="/graphs/meta">Average Number of Weeks in Top Ten Used</Link></h1>
      {this.createChart()}
    </div> : null;
  }
}

export default Meta;

Meta.defaultProps = {
  datafile: 'Meta.json'
};

Meta.propTypes ={
  datafile: PropTypes.string.isRequired
};
