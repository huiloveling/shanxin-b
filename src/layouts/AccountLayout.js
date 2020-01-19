import React, { Fragment } from 'react';
import { Link, Redirect, Switch, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Icon } from 'antd';
import styles from './AccountLayout.less';
import { getRoutes } from '../utils/utils';
import flowRecord from './../utils/flowRecord'
const links = [{
  key: 'help',
  title: '帮助',
  href: '',
}, {
  key: 'privacy',
  title: '隐私',
  href: '',
}, {
  key: 'terms',
  title: '条款',
  href: '',
}];

const copyright = <Fragment>Copyright <Icon type="copyright" />薪动</Fragment>;

class AccountLayout extends React.PureComponent {
  componentWillMount() {
    flowRecord();
  }
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = '薪动';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - 薪动`;
    }
    return title;
  }
  render() {
    const { routerData, match } = this.props;
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container}>
          <div className={styles.content}>
            <Switch>
              {getRoutes(match.path, routerData).map(item =>
                (
                  <Route
                    key={item.key}
                    path={item.path}
                    component={item.component}
                    exact={item.exact}
                  />
                )
              )}
              <Redirect exact from="/account" to="/account/login" />
            </Switch>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

export default AccountLayout;
