import React, { PureComponent } from 'react';
import { Route, Redirect, Switch } from 'dva/router';
import NotFound from '../Exception/404';
import { getRoutes } from '../../utils/utils';
import flowRecord from './../../utils/flowRecord'

export default class Auth extends PureComponent {
  componentWillMount() {
    flowRecord();
  }
  render() {
    const { match, routerData } = this.props;
    return (
        <Switch>
          {
            getRoutes(match.path, routerData).map(item => (
              <Route
                key={item.key}
                path={item.path}
                component={item.component}
                exact={item.exact}
              />
            ))
          }
          <Redirect exact from="/auth" to="/auth/show" />
          <Route render={NotFound} />
        </Switch>
    );
  }
}
