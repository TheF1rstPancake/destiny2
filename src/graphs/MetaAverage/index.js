
import React from 'react';
import BaseGraph from '../BaseGraph';
import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

class Meta extends BaseGraph {
  constructor() {
    super();
    this.formatData = this.formatData.bind(this);
    this.createChart = this.createChart.bind(this);
  }
  formatData(data) {

    var u_x = Object.keys(data.averages).map((i) => {
      return String(Number.parseInt(i) + 1);
    });

    var ungrouped = {
      name: 'ungrouned',
      x: u_x,
      y: data.averages.map((w) => {
        return w.average;
      }),
      type: 'bar',
    };

    
    var bounds = 3;
    var grouped_y = [];
    var grouped_x = [];
    for (var i = 0; i < data.averages.length; i+=bounds) {
      grouped_x.push(`[${ i+1 }, ${ i+1+bounds })`);
      var ratios = 0;
      var num_weapons = 0;
      for (var j=0; j < bounds; j++) {
        if (data.averages[i+j] === undefined) {
          break;
        }
        var num =  data.averages[i+j].num_weapons;
        ratios += data.averages[i+j].average *  num;
        num_weapons +=num;
      }        
      grouped_y.push(ratios/num_weapons);
    }

    
    var grouped = {
      name: 'grouped',
      x: grouped_x,
      y: grouped_y,
      type: 'bar',
    };

    // we have to manage the x_axis outside of the chart data
    // the updatemenus actually overwrites the data in the chart
    // so we should save the x-axes somewhere safe
    this.x_axis = {
      grouped: grouped.x,
      ungrouped: ungrouped.x
    };

    var data = [ungrouped, grouped];
    return data;
  }

  createChart() {
    var chartData = this.state.chartData;
    console.log("CREATING CHART: ", chartData);
    return <Plot
      data={ chartData }
      className='plot-class'
      layout={{ 
        autosize: true, 
        margin: this.default_layout.margin,
        showlegend: false,
        xaxis: { automargin: true },
        updatemenus: [
          {
            buttons: [
              {
                args: [
                  { 'visible': [true, false],  x: [this.x_axis.ungrouped, []] }
                ],
                label: 'Reset',
                method: 'update'
              },
              {
                args: [{ 'visible': [false, true],  x: [[], this.x_axis.grouped] }],
                label: 'Group',
                method: 'update'
              }
            ],
            type: 'buttons',
            showactive: true
          }
        ]
      }}
      useResizeHandler={true}
      config={this.default_config}
    />;
  }

  render() {
    return this.state.chartData !== undefined ? 
    <div className="graph">
      <h1><Link to="/graphs/metaaverages">Average Usage Rate by Number of Weeks in Meta</Link></h1>
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
