import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Button, Card} from "antd"
import moment from "moment/moment";

import styles from "./NoticeDetail.less"
import flowRecord from './../../../utils/flowRecord'

@connect(({notice})=>({
  notice,
}))
export default class NoticeDetail extends PureComponent{
  componentWillMount() {
    flowRecord();
  }
  componentDidMount() {
    const {dispatch, match} = this.props;
    dispatch({
      type: 'notice/detail',
      payload: {
        id: match.params.id,
      }
    });
  }

  render(){
    const {currentItem: notice} = this.props.notice;

    return (
      notice && <Card className={styles.notice}>
        <div className={styles.title}>{notice.title}</div>
        { notice.summary && <div className={styles.summary}>{notice.summary}</div> }
        <div className={styles.content} dangerouslySetInnerHTML={{__html:notice.content}}></div>
        <div style={{textAlign:'right',paddingRight:'24px'}}>{moment(notice.publishTime).format('YYYY-MM-DD HH:mm:ss')}</div>
        <div className={styles.actions}>
          <Button type="primary" onClick={()=>{this.props.history.push("/notice/list")}}>返回</Button>
        </div>
      </Card>
    );
  }
}
