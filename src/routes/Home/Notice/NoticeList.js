import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import moment from 'moment';
import {  Form, List, Button, Modal,Card,message, Avatar, Spin ,Pagination} from 'antd';
import styles from '../../../assets/less/List.less';
import flowRecord from './../../../utils/flowRecord'

@connect(({notice,modalModel, loading}) => ({
  notice,
  modalModel,
  loading: loading.models.notice,
}))
@Form.create()
export default class NoticeList extends PureComponent {
  currentPage = 1;
  pageSize = 20;
  total = 0;
  componentWillMount() {
    flowRecord();
  }
  componentDidMount() {
    if(this.props.notice.data.records == null){
      this.fetchData();
    }
  }
  /**
   * 点击列表标题时调用的 function ，此 function 会把 modal 需要的参数设置到states中对应的变量里，然后显示出来
   */
  showNotice = item =>{
    this.props.history.push("/notice/detail/"+item.id);
  }

  /**
   * 渲染 renderListItem
   */
  renderListItem = item => {
    return (
    <List.Item>
      <List.Item.Meta
        title={<a onClick={()=>{this.showNotice(item)}}>{item.title}</a>}
      />
      <div>{moment(item.publishTime).format('YYYY-MM-DD HH:mm:ss')}</div>
    </List.Item>
  )}

  /**
   * 向服务器请求数据
   */
  fetchData=()=>{
    this.props.dispatch({
      type:'notice/list',
      payload:{
        size:this.pageSize,
        current:this.currentPage
      }
    })
  }

  onChange=(currentPage)=>{
      this.props.dispatch({
        type:'notice/list',
        payload:{
          size:this.pageSize,
          current:currentPage
        }
      })
  }

  /**
   * 渲染页面
   */
  render() {
    const { loading, notice:{ data } } = this.props;
    return (
      <Card extra={<span>共有 {data.total} 条记录</span>} title="系统公告" bordered={false}>
        {/*渲染公告列表*/}
        <List
          className="demo-loadmore-list"
          loading={loading}
          itemLayout="horizontal"
          dataSource={data.records}
          renderItem={this.renderListItem}
        />
        <div style={{textAlign:"right", marginTop:'15px'}}>
          <Pagination onChange={this.onChange} current={data.current} total={data.total} pageSize={this.pageSize}/>
        </div>
      </Card>
    );
  }
}
