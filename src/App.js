/* global Plotly:true */

import React, { Component } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

class App extends Component {
  constructor() {
    super();
    this.state = { message: '' };

    this.createChart = this.createChart.bind(this);
    this.formatDate = this.formatDate.bind(this);
  }

  componentDidMount() {
    fetch('/api/message')
      .then(response => response.json())
      .then(json => this.setState({ message: json }));

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

  formatDate(d) {
    return `${ d.getUTCMonth()+1 }/${ d.getUTCDate() }`;
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
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>{this.state.message}</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        {this.state.chartData !== undefined ? this.createChart():null}
      </div>
    );
  }
}

export default App;
