import React, {Component} from 'react';
import { connect } from 'dva';
import {Link} from 'dva/router';
import {userInfoUtil} from '../../../utils/UserInfoUtil';
import { Card} from 'antd';
import {cons} from '../../../common/constant';
import Iframe from 'react-iframe'
import StandardTable from '../../../components/StandardTable';
import {Form} from "antd";
import flowRecord from './../../../utils/flowRecord'

const customerId = userInfoUtil.getCurrentUser()?userInfoUtil.getCurrentUser().bizCustomer.id:null;
const platform = userInfoUtil.getCurrentUser()?userInfoUtil.getCurrentUser().bizCustomer.salaryPlatform:null;
const url = cons.url.base_url + "/jdjr/h5/enter/login?customerId="+customerId;

@connect(({financial,company,formModel,modalModel,loading}) => ({
  formModel,
  modalModel,
  financial,
  company,
  loading: loading.models.financial,
}))
@Form.create()
export default class FinancialList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      platforms:platform,
      accountName:'',
      balance:'',
      totalAmount:'',
    }
  }

  componentWillMount(){
    flowRecord();
    if(this.state.platforms == 'pingan'){
      this.props.dispatch({type:'financial/details'}).then((res)=>{
          console.log(res);
        if(res.code == '0'){
          const { data: { accountName='',balance='',totalAmount='' }} = res;
          this.setState({accountName,balance,totalAmount})
        }else{
          window.layer.msg(res.msg);
        }
      })
    }
  }
  render() {
    const {loading}= this.props;
    const data = {hidePagination: true, records: [this.state]}
    const columns =[
      {
        title: '商户名称',
        dataIndex: 'accountName',
        key: 'accountName',
      },
      {
        title: '总金额',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
      },
      {
        title: '可用金额',
        dataIndex: 'balance',
        key: 'balance',
      },
      {
        title: '交易明细',
        render: () => (
          <div>
            <Link to={'/settings/historyDetail'}>查看详情</Link>
          </div>
        ),
      },];
    return (
      <div>
        {this.state.platforms == 'pingan' ? (
          <Card bordered={false}>
            <div style={{marginTop:'2rem',marginBottom:'2rem'}}>
              <StandardTable
                loading={loading}
                data={data}
                columns={columns}
              />
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
