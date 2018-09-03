/* global Plotly:true */
import React, { Component } from 'react';

/*import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);*/

class BaseGraph extends Component {
  constructor() {
    super();
    this.state = {};
    this.formatDate = this.formatDate.bind(this);
    //this.Plot = Plot;
  }

  formatDate(d) {
    return `${ d.getUTCMonth()+1 }/${ d.getUTCDate() }`;
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
