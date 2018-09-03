import React, { Component } from 'react';

class Footer extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className="footer">
      {this.props.children}
    </div>;
  }
}

export default Footer;