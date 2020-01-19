import React, { Component } from 'react';
import { connect } from 'dva';
import flowRecord from './../../utils/flowRecord'

@connect(({ login, loading }) => ({
  login,
}))
export default class Logout extends Component {
  componentWillMount() {
    flowRecord();
    this.props.dispatch({
      type:'login/logout',
    })
  }

  render() {
    return null;
  }
}
