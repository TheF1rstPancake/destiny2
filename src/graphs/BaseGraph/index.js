import React, { Component } from 'react';
import axios from 'axios';
class BaseGraph extends Component {
  constructor() {
    super();
    this.state = {};
    this.graph_data_location = '/destiny2/graph_data';
    this.formatDate = this.formatDate.bind(this);
    this.default_layout = { 
      margin: {
        t: 20,
        b: 20,
      }
    };
    this.default_config = {
      modeBarButtonsToRemove: ['lasso2d', 'autoScale2d', 'hoverClosestCartesian', 'toggleSpikelines', 'sendDataToCloud']
    };
  }

  formatDate(d) {
    return `${ d.getUTCMonth()+1 }/${ d.getUTCDate() }`;
  }

  componentDidMount() {
    if (this.props.datafile !== undefined) {
      axios.get(`${ this.graph_data_location }/${ this.props.datafile }`)
        .then((data) => {
          let chartData = data.data;

          // if the base class has defined a "formatData" function
          // we should run it here
          if (this.formatData !== undefined) {
            chartData = this.formatData(chartData);
          }
          this.setState({ 
            chartData: chartData
          });
        }).catch((err) => {
          console.log("ERR MOUNTING: ", err);
        });
    }
  }
  getDateFromYearAndWeek(y, w) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  }

  
  render() {
    return null;
  }
}

export default BaseGraph;
