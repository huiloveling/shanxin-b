import React, {Component} from 'react';
import { connect } from 'dva';
import {Link} from 'dva/router';
import {userInfoUtil} from '../../../utils/UserInfoUtil';
import { Card, Row, Col, Form, DatePicker, Button,Table,Icon} from 'antd';
import {cons} from '../../../common/constant';
import Iframe from 'react-iframe'
import styles from './../../../assets/less/List2.less';
import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import flowRecord from './../../../utils/flowRecord'
const customerId = userInfoUtil.getCurrentUser()?userInfoUtil.getCurrentUser().bizCustomer.id:null;
const platform = userInfoUtil.getCurrentUser()?userInfoUtil.getCurrentUser().bizCustomer.salaryPlatform:null;
const url = cons.url.base_url + "/jdjr/h5/enter/login?customerId="+customerId;
const { RangePicker } = DatePicker;
@connect(({detailList,company,loading}) => ({
  detailList,
  company,
  loading: loading.models.detailList,
}))
@Form.create()
export default class HistoryDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
        platforms:platform,
        accountName:'',
        balance:'',
        totalAmount:'',
        list:[],
        timeStart:"",
        timeEnd:"",
        leftActive:true,
        rightActive:false,
        pageNo:1,
        toDayDate:""
    }
  }

  componentWillMount(){
    flowRecord();
    if(this.state.platforms == 'pingan'){
        var myDate = new Date();
        var years = myDate.getFullYear();
        var months = myDate.getMonth()+1; //获取当前月份(0-11,0代表1月)
        var days = myDate.getDate();
        if(months<10){
            months = "0"+months;
        }
        if(days<10){
            days = "0"+days;
        }
        var nowDay = years+""+months+""+days;
        this.setState({
            toDayDate:nowDay
        })
        this.setState({
            timeStart:nowDay,
            timeEnd:nowDay
        },function(){
            this.refresh();
        })
    }
  }
  /**
   * 处理表格的分页，过滤，排序器
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
      console.log(pagination);
      console.log(filtersArg);
      console.log(sorter);
      return;
    const {dispatch,formModel:{formValues}} = this.props;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = {...obj};
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      current: pagination.current,
      size: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      if (sorter.order == 'ascend') {
        params.ascs = sorter.field;
      } else {
        params.descs = sorter.field;
      }
    }
    dispatch({
      type: 'finance/query',
      payload: {
        ...params,
        ...this.state.tabValues,
        managerId: this.state.managerId
      },
    });
  }


  queryList = ()=>{
      if(this.state.timeStart==""){
          this.setState({
              list:[],
              leftActive:true,
              pageNo:1,
              rightActive:true,
          })
          alert("时间不能为空");
          return;
      }
      if(this.state.timeEnd==""){
          this.setState({
              list:[],
              leftActive:true,
              pageNo:1,
              rightActive:true,
          })
          alert("时间不能为空");
          return;
      }
      this.refresh();
  }
  timeChange = (item)=>{
      if(!item.length==0){
          this.setState({
              timeStart:item[0].format("YYYYMMDD"),
              timeEnd:item[1].format("YYYYMMDD"),
          },function(){
              console.log(this.state.timeStart);
          })
      }else{
          this.setState({
              timeStart:"",
              timeEnd:"",
          },function(){
              console.log(this.state.timeStart);
          })
      }
  }
  refresh = ()=>{
      const params = {};
      params.beginDate= this.state.timeStart;
      params.endDate= this.state.timeEnd;
      params.pageNo= this.state.pageNo;
      params.pageSize= 30;
      console.log(params);
      this.props.dispatch({
          type:'finance/query',
          payload: params
      }).then((res)=>{
          console.log(res);
          if(res.code == '0'){
             this.setState({
                 list:res.data
             })
             console.log(this.state.list);
             if(res.data.length<30){
                 this.setState({
                     rightActive:true,
                 })
             }else{
                 this.setState({
                     rightActive:false,
                 })
             }
             if(this.state.pageNo>1){
                 this.setState({
                     leftActive:false,
                 })
             }else{
                 this.setState({
                     leftActive:true,
                 })
             }
          }else{
              this.setState({
                  list:[]
              })
             alert(res.msg);
          }
      })
  }
  nextList=()=>{
      this.setState({
          pageNo:this.state.pageNo+=1
      },this.refresh());
  }
  leftList=()=>{
      this.setState({
          pageNo:this.state.pageNo-=1
      },this.refresh());
  }
  render() {
    const {loading}= this.props;
    const {
        leftActive,
        rightActive,
    } = this.state;
    const data = {hidePagination: false, records: this.state.list}
    const paginationProps = {
      defaultPageSize:30,
      total: data.total,
      current: data.current,
      pageSize: 30
    };
    const columns =[
        {
            title: '付款方账号',
            dataIndex: 'OutAcctNo',
            key: 'OutAcctNo',
        },
        {
            title: '付款方户名',
            dataIndex: 'OutAcctName',
            key: 'OutAcctName',
        },
        {
            title: '交易金额',
            dataIndex: 'TranAmount',
            key: 'TranAmount',
        },
        {
            title: '收款方账号',
            dataIndex: 'InAcctNo',
        },
        {
            title: '可用金额',
            dataIndex: 'AcctBalance',
            key: 'AcctBalance',
      },];
    return (
      <div>
        {this.state.platforms == 'pingan' ? (
          <Card bordered={false}>
            <div className={styles.tableList}>
              <div className={styles.tableListForm}>
                <div>
                  <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                    <Col md={6} sm={18} style={{ display : 'flex',alignItems:"center" }}>
                      <label style={{minWidth:"44px",width:"auto",marginRight:"8px"}}>时间：</label>
                      <RangePicker
                        onChange={this.timeChange}
                        defaultValue={[moment(this.state.timeStart, 'YYYY-MM-DD'),moment(this.state.timeEnd, 'YYYY-MM-DD')]}
                        format="YYYY/MM/DD"
                        locale={locale}
                      />
                    </Col>
                    <Col md={6} sm={18} style={{ display : 'flex',alignItems:"center" }}>
                      <span className={styles.submitButtons}>
                        <Button type="primary" onClick={this.queryList}>
                          查询
                        </Button>
                      </span>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
            <div style={{marginTop:'2rem',marginBottom:'2rem'}}>
                <Table
                    bordered={true}
                    loading={loading}
                    dataSource={data.records}
                    columns={columns}
                    pagination={false}
                    onChange={this.handleStandardTableChange}
                />
                <div className={styles.iconWrap}>
                    <a className={styles.iconleft} disabled={leftActive} onClick={this.leftList}>
                        <Icon type="left" />
                    </a>
                    <a className={styles.iconleft}>
                        <label>{this.state.pageNo}</label>
                    </a>
                    <a className={styles.iconleft}disabled={rightActive} onClick={this.nextList}>
                        <Icon type="right" />
                    </a>
                </div>
            </div>
          </Card>
        ) : (<Iframe url={url}
                    width="1600px"
                    height="900px"
                    id="myId"
                    className="myClassname"
                    display="initial"
                    position="relative"
                    allowFullScreen/>)}
      </div>
    )
  }
}
