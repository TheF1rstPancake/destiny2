
import React from 'react';
import axios from 'axios';
import BaseGraph from '../BaseGraph';
import Plot from 'react-plotly.js';

class QuitRateByWeek extends BaseGraph {
  constructor() {
    super();
    this.state = {};

    this.createChart = this.createChart.bind(this);
  }

  componentDidMount() {
    axios.get("/api/weekly")
      .then((response) => {
        // format the data in the way that we need it
        var x = [];
        var y = [];
        for (var i in response.data) {
          x.push(
            `${ this.formatDate(new Date(response.data[i].start)) }-${ this.formatDate(new Date(response.data[i].end)) }`
          );
          y.push(response.data[i].quits/response.data[i].num_games);
        }
        this.setState({ 
          weekly: response.data,
          chartData: {
            x: x,
            y: y
          }
        });
      });
  }

  createChart() {
    var chartData = this.state.chartData;
    chartData.type = "line";
    chartData.name="Quit Rate";
    return <Plot
      data={[chartData]}
    />;
  }

  render() {
    return <div>{
      this.state.chartData !== undefined ? this.createChart():null
    }</div>;
  }
}

export default QuitRateByWeek;
