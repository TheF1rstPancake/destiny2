
import React from 'react';
import axios from 'axios';
import BaseGraph from '../BaseGraph';
import { TopTenWeaponsData } from '../../graph_data';
import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';


class TopTenWeapons extends BaseGraph {
  constructor() {
    super();
    this.state = {};
   


    this.formatData = this.formatData.bind(this);
    this.createChart = this.createChart.bind(this);

    // format the data
    this.state.chartData = this.formatData(TopTenWeaponsData);
  }
  formatData() {
    var _this = this;
    var data = TopTenWeaponsData.data.filter(function(d) {
      if (d.data.length >= 3) {
        return d;
      }
    }).map(function(weapon) {
      weapon.data = weapon.data.sort(function(a, b) {
        if (a.date.year < b.date.year) {
          return -1;
        } else if (a.date.year === b.date.year) {
          if (a.date.week < b.date.week) {
            return -1;
          } else {
            return 1;
          }
        } else {
          return 1;
        }
      });
      
      return {
        type: "scatter",
        mode: "markers",
        x: weapon.data.map(function(d) {
          return _this.getDateFromYearAndWeek(d.date.year, d.date.week);
        }),
        y: weapon.data.map(function(d) {return d.ratio;}),
        name: weapon._id.name
      };
    });
    data.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name === b.name) {
        return 0;
      } else {
        return 1;
      }
    });
    return data;
  }

  componentDidMount() {

  }

  createChart() {
    var chartData = this.state.chartData;
    chartData.type = "scatter";
    chartData.name="Top Ten";
    return <Plot
      data={chartData}
      layout={{ autosize: true }}
      useResizeHandler={true}
      className="plot-class"
      config={{
        modeBarButtonsToRemove: ['lasso2d', 'autoScale2d', 'hoverClosestCartesian', 'toggleSpikelines']
      }}
    />;
  }

  render() {
    return <div id="TopTenWeaponsChart" className="graph">
      <h1><Link to="/graphs/toptenweapons">Top Ten Weapons per Week</Link></h1>
      {
        this.state.chartData !== undefined ? this.createChart():null
      }
    </div>;
  }
}

export default TopTenWeapons;
