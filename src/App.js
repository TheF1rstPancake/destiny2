import React, { Component } from 'react';
import logo from './logo-down.jpg';
import './App.css';
import PropTypes from "prop-types";
import { Route, Link, Switch, Redirect } from "react-router-dom";

import Posts from './posts';
import MetaPost from './posts/Meta';

import Graphs from './graphs';
import Footer from './components/Footer';

class App extends Component {
  constructor() {
    super();
    this.state = { 
      message: ''
    };
  }
  getChildContext() {
    return {
      location: this.props.location,
    };
  }
  componentDidMount() {
    // pull params off of the location
    // and see if this was a redirect from the GitHub 404 page
    var search = this.props.location.search;
    var params = search.slice(1).split("&");
    var obj = {};
    for (var i=0; i< params.length; i++) {
      var l = params[i].split("=");
      obj[l[0]] = l[1] !== undefined && l[1] !== '' ? l[1].replace("%2F", "/") : null;
    }
    this.setState(obj);
  }
  

  // here we will render our standard header and footer
  // we will also allow this level to initialize most of the routes that we want to manage.
  // some of these routes may have sub routes 
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </div>
        <div className="gradient-border"></div>
        <div className="App-container">
          <Switch>
              <Route exact path="/posts" component={Posts}/>
              <Route path="/posts/meta" component={MetaPost}/>
              <Route path="/graphs" component={Graphs}/>
          </Switch>
        </div>
        <Footer>
          <div className="flex-row flex-full">
            <div className="flex-half center-text">
              <Link to="/posts">Posts</Link>
            </div>
            <div className="flex-half center-text">
              <Link to="/graphs">Graphs</Link> 
            </div>
            
          </div>
          <div className="flex-row flex-full">
            <div className="flex-full center-text">
              <a href="https://www.pattibutler.com/">Logo credit to Patti Butler</a>
              </div>
          </div>
        </Footer>

        {this.state.redirect === 'true' ? 
          <Redirect to={this.state.pathname}/>
          : null }
      </div>
    );
  }
}

App.childContextTypes = {
  location: PropTypes.object
};

export default App;
