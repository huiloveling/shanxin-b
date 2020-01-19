import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import numeral from 'numeral';
import { Card, Row, Col, Form, Input,Button, Modal, Tabs } from 'antd';
import styles from '../../../assets/less/List.less';
import salaryHistoryDetailStyle from './SalaryHistoryDetail.less';
import StandardTable from '../../../components/StandardTable';
import {userInfoUtil as userUtil} from "../../../utils/UserInfoUtil";
import {cons} from '../../../common/constant';
import flowRecord from './../../../utils/flowRecord'

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

/**
 * 定义 modal 弹出窗口组件
 */
const CreateForm = Form.create()((props) => {
  const {modalVisible,handleCancel,modalTitle, modalContent,modalFooterText} = props;
  return <Modal
    title={modalTitle}
    visible={modalVisible}
    onCancel={handleCancel}
    onOk={handleCancel}
    footer={<Button type="primary" onClick={handleCancel}>{modalFooterText}</Button>}
      >
      {modalContent}
    </Modal>
});

@connect(({salaryHistoryDetail,formModel,modalModel,loading}) => ({
  formModel,
  modalModel,
  salaryHistoryDetail,
  loading: loading.models.salaryHistoryDetail,
}))
@Form.create()
export default class SalaryHistoryDetail extends PureComponent {

    state={
      currentTab:"3",
      currentTabState:["0","1","2","3"], //当前标签页对应的状态， 就是 全部 发放失败 发放成功，这个状态
      currentItem:{},  //存储触发操作的记录，用于显示发放失败原因，目前能获取到的原因只有认证与否。。
      successArr:["2"],
      unSuccessArr:["3"],
      all:["0","1","2","3"],
      allowDownload:false,
    };

  //取出从url传来的数据
  batchId = this.props.match.params.batchId;  //取出 record id 用来查记录信息
  companyId = this.props.match.params.companyId;
  allowDownloadUrl = cons.url.base_url +"/salary/batch/export/fail/excel?batchId=" + this.batchId; //用来下载发薪失败文件的URL

  componentWillMount() {
    flowRecord();
  }
  async componentDidMount() {
    await this.props.dispatch({
      type:'salaryHistoryDetail/list',
      payload: {
        salaryBatchId: this.batchId,
        companyId:this.companyId,
        state: this.currentTabState,
      }
    });
    const {salaryHistoryDetail:{data:{records}}} = this.props;
    if(records.filter((item)=> item.state == 3).length>0){
      this.setState({allowDownload:true})
    }
  }

  /**
   * 处理modal的取消操作
   */
  handleCancel = () => {
    this.props.dispatch({
      type: 'modalModel/hideModal',
    });
  }

  /**
   * 处理表格的分页，过滤，排序器
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
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
      type: 'salaryHistoryDetail/list',
      payload: {
        ...params,
        state:this.state.currentTabState,
        salaryBatchId: this.batchId,
        companyId:this.companyId,
      },
    });
  }

  /**
   * 重置搜索框
   */
  handleSearchReset = () => {
    const {form, dispatch} = this.props;
    form.resetFields();
    dispatch({
      type: 'salaryHistoryDetail/list',
      payload: {
        salaryBatchId: this.batchId,
        companyId:this.companyId,
        state: this.state.currentTabState
      }
    });
  }

  /**
   * 处理历史记录页面查询的函数
   */
  handleSearch = (e) => {
    e.preventDefault();
    const {dispatch, form} = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      //取出表中字段
      const values = {
        ...fieldsValue
      };
      // 向服务器请求数据
      dispatch({
        type:'salaryHistoryDetail/list',
        payload: {
          ...values,
          salaryBatchId: this.batchId,
          companyId:this.companyId,
          state:this.state.currentTabState
        },
      });
    });
  }

  /**
   * 切换tab时的触发的钩子函数
   * @param activeKey
   */
  handleTabChange = (activeKey) => {
    let currentTabState;
    if(activeKey=="0") {
      currentTabState=this.state.unSuccessArr;
    }else if(activeKey=="1") {
      currentTabState=this.state.successArr;
    }else {
      currentTabState=this.state.all;
    }
    this.setState({currentTab:activeKey});
    this.setState({currentTabState:currentTabState});
    this.props.dispatch({
      type:'salaryHistoryDetail/list',
      payload:{
        salaryBatchId: this.batchId,
        companyId:this.companyId,
        state:currentTabState
      }
    })
  }

  /**
   * 渲染工资条modal
   */
  renderSalaryTicket = (record) => {
    this.setState({currentItem:record});  //设置当前操作的记录
    this.props.dispatch({
      type:'salaryHistoryDetail/salaryPayroll',
      payload:{
        salaryDetailId:record.id
      }
    }).then(()=>{
      this.props.dispatch({ type:'modalModel/showModal' });
    });
  }

  renderSalaryDetail = ()=>{
    const {salaryHistoryDetail:{salaryPayrollData = {}}} = this.props;
    const{fields, salaryPayroll} = salaryPayrollData;
    return(<table className={salaryHistoryDetailStyle.payroll__table}>
      {
        fields && fields.map((field)=>{
          return <tr key={field.id}>
            <td>{field.fieldName}</td>
            <td>{salaryPayroll[field.fieldName]}</td>
          </tr>
        })
      }
    </table>);
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    const {salaryHistoryDetail:{data}, loading}= this.props;
    const {bizCustomer:{salaryPlatform}} = userUtil.getCurrentUser();
    //工资条modal需要的参数
    const {currentItem} = this.state;
    const modalSetting = {
      modalTitle: <span>工资条详情 <span style={{fontSize:"12px",color:"red"}}>{currentItem.salaryDetail&&currentItem.salaryDetail.failReason?","+currentItem.salaryDetail.failReason:""}</span></span>,
      modalContent: this.renderSalaryDetail(),
      modalFooterText:'确定',
    };
    const {modalModel: {modalVisible}} = this.props;
    const modalParams={
      modalVisible,
      handleCancel:this.handleCancel,
      ...modalSetting,
    };

    const status = ['待发薪', '发薪中', '发薪成功', '发薪失败'];

    //具体的 dataIndex 等之后写逻辑时在改成和后端传来的内容一致的字段名，目前先占位即可
    //表格使用的列名，死的，而且重复的，因此直接定义成类变量，所有表格共用
    let columns =[
      {
        title: '姓名',
        dataIndex: 'emp.name',
      },
      {
        title: '发工资月份',
        dataIndex: 'startDate',
        render: (text, record) => {
          const {startDate, endDate} = record;
          return startDate == endDate ? startDate: (startDate + ' 到 ' +endDate);
        }
      },
      {
        title: '身份证号',
        dataIndex: 'emp.idcard',
      },
      {
        title: '发放金额（元）',
        dataIndex: 'salary',
        align: 'right',
        render: (val) => {
          return numeral(val).format('0,0.00');
        }
      },
      {
        title: '用户手机号',
        dataIndex: 'emp.phone',
      },
      {
        title: '用户状态',
        dataIndex: 'emp.jdjrState',
        render:(text)=>{
          if (text == "0") {
            return "待认证";
          } else if (text == "1") {
            return "认证成功";
          } else {
            return "认证失败";
          }
        }
      },
      {
        title: '发薪状态',
        dataIndex: 'state',
        render:(val)=>{
          return <span className={{2:salaryHistoryDetailStyle.green,3:salaryHistoryDetailStyle.red}[val]}>{status[val]}</span>
        }
      },
      {
        title: '操作',
        render: (text, record) => (
          <span>
            <a onClick={() => {
              this.renderSalaryTicket(record)
            }}>查看详情</a>
          </span>
        ),
      },];
      if(salaryPlatform == 'pingan' ){
        columns = columns.filter(item =>item.title != "用户状态");
      }
    return (
        <Card bordered={false}>
          <p>{this.companyName}</p>
          {/*搜索栏*/}
          <Form onSubmit={this.handleSearch} layout="inline">
            <Row>
              <Col>
                <FormItem label="请输入工友姓名或身份证号">
                  {getFieldDecorator('keyword')(
                    <Input placeholder="请输入"/>
                  )}
                </FormItem>
                <span className={styles.submitButtons}>
                  <Button type="primary" htmlType="submit">查询</Button>
                  <Button style={{marginLeft: 8, marginTop:4}} onClick={this.handleSearchReset}>重置</Button>
                </span>
                <span className={salaryHistoryDetailStyle.exportButton}>
                   <Button type="primary"  disabled={!this.state.allowDownload} href={this.allowDownloadUrl}>下载发薪失败文件</Button>
                </span>
              </Col>
            </Row>
          </Form>
          {/*Tab*/}
          <Tabs defaultActiveKey={this.state.currentTab} onChange={this.handleTabChange}>
            <TabPane tab="全部" key="3"> </TabPane>
            <TabPane tab="发放成功" key="1"> </TabPane>
            <TabPane tab="发放失败" key="0"> </TabPane>
          </Tabs>
          {/*表格*/}
          <StandardTable
            loading={loading}
            data={data}
            columns={columns}
            onChange={this.handleStandardTableChange}
          />
          {/*工资条 modal*/}
          <CreateForm
            {...modalParams}n
          />
        </Card>
    )
  }
}
