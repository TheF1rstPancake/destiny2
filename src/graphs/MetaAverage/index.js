
import React from 'react';
import BaseGraph from '../BaseGraph';
import { MetaData } from '../../graph_data';
import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';

class Meta extends BaseGraph {
  constructor() {
    super();
    this.formatData = this.formatData.bind(this);
    this.createChart = this.createChart.bind(this);
    this.group = this.group.bind(this);
  }
  formatData(group) {
    group = group === undefined ? false : group;
    var x = null; 
    var y = null;
    
    if (group === false) {
      x = Object.keys(MetaData.averages).map((i) => {return Number.parseInt(i)+1;});
      y = MetaData.averages.map((w) => {
        return w.average;
      }); 
    } else if (group === true) {
      var bounds = 3;
      y = [];
      x = [];
      for (var i = 0; i < MetaData.averages.length; i+=bounds) {
        x.push(`[${ i+1 }, ${ i+1+bounds })`);
        var ratios = 0;
        var num_weapons = 0;
        for (var j=0; j < bounds; j++) {
          if (MetaData.averages[i+j] === undefined) {
            break;
          }
          var num =  MetaData.averages[i+j].num_weapons;
          ratios += MetaData.averages[i+j].average *  num;
          num_weapons +=num;
        }        
        y.push(ratios/num_weapons);
      }
    }

    var data = [{
      type: "bar",
      y: y,
      x: x
    }];
    console.log("META AVERAGE", data);
    return data;
  }

  componentDidMount() {
    this.setState({ chartData: this.formatData() });
  }
  group() {
    var group = !this.state.group;
  
    this.setState({ 
      chartData: this.formatData(group),
      group: group
    });
  }

  createChart() {
    var chartData = this.state.chartData;
    chartData.type = "bar";
    chartData.name="Top Ten Averages";
    return <Plot
      data={chartData}
      className='plot-class'
      layout={{ autosize: true, margin: this.default_layout.margin }}
      useResizeHandler={true}
      config={this.default_config}
    />;
  }

  render() {
    return this.state.chartData !== undefined ? 
    <div className="graph">
      <h1><Link to="/graphs/metaaverages">Average Usage Rate by Number of Weeks in Meta</Link></h1>
      <button onClick={this.group}>
      {this.state.group === true ? 'Ungroup' : 'Group' }
      </button>
      {this.createChart()}
    </div> : null;
  }
}

export default Meta;
