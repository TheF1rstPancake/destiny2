import React, { Component } from 'react';
import { Link } from "react-router-dom";


class Posts extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className="posts">
      <Link to={`${ this.props.match.url }/meta`}>Meta</Link>
      <br/>
      <Link to={`${ this.props.match.url }/gambit_fireteams`}>Gambit Fireteams</Link>
    </div>;
  }
}

export default Posts;