import React, { Component } from 'react';
import { Link } from "react-router-dom";

import MetaPost from './Meta';

class Posts extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div>
      <Link to={`${ this.props.match.url }/meta`}>Meta</Link>
    </div>;
  }
}

export default Posts;