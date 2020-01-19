import React from 'react';
import { Button } from 'antd';
import { Link } from 'dva/router';
import Result from '../../components/Result';
import styles from './RegisterResult.less';

const actions = (
  <div className={styles.actions}>
    {/*<a href=""><Button size="large" type="primary">查看邮箱</Button></a>*/}
    <Link to="/"><Button size="large">返回首页</Button></Link>
  </div>
);

export default ({ location }) => (
  <Result
    className={styles.registerResult}
    type="success"
    title={
      <div className={styles.title}>
        你的账户：{location.state ? location.state.account : 'AntDesign@example.com'} 注册成功
      </div>
    }
    description="如需帮助，请致电薪动官方统一热线400-010-7878！"
    actions={actions}
    style={{ marginTop: 56 }}
  />
);
