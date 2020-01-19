import React, {Component} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import {Alert} from 'antd';
import Login from '../../components/Login';
import styles from './Login.less';
import {userInfoUtil} from '../../utils/UserInfoUtil';

import logo from '../../../public/img/logo.png'
import flowRecord from './../../utils/flowRecord'

const {UserName, Password, Submit} = Login;

@connect(({login, loading}) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: false, //是否自动登陆的判断
  }

  componentWillMount() {
    flowRecord();
    const user = userInfoUtil.getCurrentUser()
    if (user) {
      window.location.href = '/home';
    }
  }

  onTabChange = (type) => {
    this.setState({type});
  }

  handleSubmit = (err, values) => {
    const {type} = this.state;
    if (!err) {
      this.props.dispatch({
        type: 'login/login',
        payload: {
          ...values,
          type,
          autoLogin: this.state.autoLogin,
        },
      });
    }
  }

  changeAutoLogin = (e) => {
    this.setState({
      autoLogin: e.target.checked,
    });
  }

  renderMessage = (content) => {
    return (
      <Alert style={{marginBottom: 24}} message={content} type="error" showIcon/>
    );
  }

  render() {
    const {login, submitting} = this.props;
    const {type} = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.herder}>
          <a className={styles.logo} href="/">
            <img src={logo}/>  
          </a>
          <span>人力资源与金融的链接者</span>
        </div>
        <div className={styles.content}>
          <div className={styles.center}>
            <div className={styles.title}>登&nbsp;&nbsp;&nbsp;&nbsp;录</div>
            <Login
              defaultActiveKey={type}
              onTabChange={this.onTabChange}
              onSubmit={this.handleSubmit}
            >
              {
                login.status === 'error' &&
                login.type === 'account' &&
                !login.submitting &&
                this.renderMessage('账户或密码错误')
              }
              <UserName className={styles.login_item_box} name="account" placeholder="用户名/手机号"/>
              <Password className={styles.login_item_box} name="password" placeholder="密码"/>
              <div className={styles.login_options}>
                <div>
                </div>
                <div className={styles.other}>
                  <a style={{float: 'left'}} href='/account/forgetPassword'>忘记密码？</a>
                </div>
              </div>
              <Submit loading={submitting} className={styles.btn_login}>登录</Submit>
              <div className={styles.register}>
                <span>还没有账号？</span>
                <Link to="/account/register">注册账户</Link>
              </div>
            </Login>
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.inner_content}>
              <p>薪动（青岛）网络科技有限公司 鲁ICP备19007302号</p>
          </div>
        </div>
      </div>
    );
  }
}
