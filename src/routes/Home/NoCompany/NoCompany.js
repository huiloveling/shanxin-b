import React, {PureComponent, Fragment} from 'react';
import {Link} from 'dva/router';
import {Card, Button} from 'antd';
import styles from './NoCompany.less';
import flowRecord from './../../../utils/flowRecord'

export default class NoCompany extends PureComponent {
  componentWillMount() {
    flowRecord();
  }
  render() {
    return(
      <div className={styles.cardContainer}>
       <Card className={styles.card} title="添加企业" bordered={false}>
         <span>您尚未添加任何企业，在开始使用前请先添加企业&nbsp;</span>
         <Link to='/settings/company/add'><Button icon="plus" type='primary'>立即添加企业</Button></Link>
      </Card>
    </div>
    );
  }
}
