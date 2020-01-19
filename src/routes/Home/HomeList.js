import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import numeral from 'numeral';
import { Row, Col, Tabs,Card, Form, Upload, Input, Select, Icon, Button, Modal, message, Tooltip, Divider } from 'antd';
import { Bar } from '../../components/Charts';
import NumberInfo from '../../components/NumberInfo';
import StandardTable from '../../components/StandardTable';
import {userInfoUtil} from '../../utils/UserInfoUtil';

import salaryHistoryDetailStyle from '../Salary/SalaryHistory/SalaryHistoryDetail.less';
import formStyles from '../../assets/less/Form.less';
import styles from './HomeList.less';
import flowRecord from './../../utils/flowRecord'

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const {TextArea} = Input;
const userInfo = userInfoUtil.getCurrentUser();
const userIsAdmin = userInfo!==null&&userInfo!==undefined?userInfo.type==="1":false;

/**
 * 工资条 modal ， salaryException 用
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

const AddCompanyModal = Form.create()((props) => {
  const {modalVisible,handleCancel,modalTitle,handleOk, renderUploadComponent, renderTemplateInfo, renderSelectManager, form} = props;
  const onOk = () =>{
    form.validateFields((err,fieldsValue)=>{
      if(err) return;
      handleOk(fieldsValue,form);
    })
  }

  const onCancel = () => {
    handleCancel();
    form.resetFields();
  }

  /**
   * 渲染表单
   */
  const renderForm = () => {
    const {getFieldDecorator} = form;
    return (
      <div>
        <FormItem key="1" label="请输入企业名称">
          {getFieldDecorator('name',{
            rules:[
              {
                required: true,
                message:"请输入企业名称！"
              }
            ]
          })(
            <Input placeholder="企业名称"/>
          )}
        </FormItem>
        <FormItem key="3" label="请选择负责人">
          {getFieldDecorator('managerId',{
            initialValue:null,
            rules:[
              {
                required:true,
                message:"请选择企业负责人！"
              }
            ]
          })(
            renderSelectManager()
          )}
        </FormItem>
        <FormItem key="2" label={<span>请选择工资条模版 <Tooltip title="点击查看工资条模板说明"><Icon className={formStyles.infoIcon} onClick={renderTemplateInfo} type="info-circle-o"/></Tooltip></span>}>
          {getFieldDecorator('templateFile',{
            rules:[
              {
                required:true,
                message:"请选择工资条模板！"
              }
            ]
          })(
            renderUploadComponent()
          )}
        </FormItem>
      </div>
    );
  }

  return (
    <Modal
      title={modalTitle}
      visible={modalVisible}
      onCancel={onCancel}
      onOk={onOk}
      footer={<div><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={onOk}>确定</Button></div>}
    >
      {renderForm()}
    </Modal>
  )
});

const ReplyDissentModal = Form.create()((props) => {
  const {modalVisible,handleCancel,currentItem, submitReply, form} = props;
  const {getFieldDecorator} = form;

  const handleOk = () =>{
    form.validateFields((err,fieldsValue)=>{
      if(err) return;
      handleCancel();
      form.resetFields(); //重置表单，避免第二次弹出modal时依然有当前的内容
      submitReply(fieldsValue)
    })
  }

  const onCancel = () => {
    handleCancel();
    form.resetFields();
  }

  return (
    <Modal
      title="异议处理"
      visible={modalVisible}
      onCancel={onCancel}
      onOk={handleOk}
      footer={<div><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleOk}>回复</Button></div>}
    >
      <FormItem key="1">
        {getFieldDecorator('dissentContent')(
          <div>当前异议内容:{currentItem.content}</div>
        )}
      </FormItem>
      <FormItem key="2">
        {getFieldDecorator('replyContent',{
          initialValue: currentItem.replyContent,
        })(
          <TextArea rows={6} placeholder="请输入回复内容"/>
        )}
      </FormItem>
    </Modal>
  )
});

@connect(({stat, company, salaryHistory, modalModel, salaryHistoryDetail, salaryDissent, salaryDissentDetail, formModel, loading}) => ({
  stat,
  formModel,
  company,
  salaryHistory,
  salaryHistoryDetail,
  salaryDissent,
  salaryDissentDetail,
  modalModel,
  loading: loading.models.stat,
  salaryLoading: loading.effects['stat/salary'],
}))
export default class HomeList extends PureComponent {
  state = {
    companyModalVisible:false,
    currentActiveKey:"1",
    currentItem:{},
    currentDissentItem:{},
    dissentReplyModalVisible:false,
    fileList:[]
  };

  componentWillMount() {
    flowRecord();
  }

  //上传组件需要的参数
  uploadProps = {
    name:'templateFile',
    action: '/api/company/save',
    showUploadList:false,
    beforeUpload: file => {
      this.setState({fileList:[file]});
      return false;  //返回假，禁用上传组件的自动上传
    },
  };

  componentDidMount() {
    this.handleRefresh();

    this.props.dispatch({
      type: 'stat/companyValid'
    });
    this.props.dispatch({
      type: 'stat/empValid'
    });
    this.props.dispatch({
      type: 'stat/salaryLastMonth'
    });
    this.props.dispatch({
      type: 'stat/salary',
      payload: {
        type: 'month'
      }
    });
  }

  handleRefresh = () => {
    //请求当前用户负责的所有企业的工资历史数据
    this.props.dispatch({
      type: 'company/resentSalaryList',
      payload: {
        managerId: '',  //userid为null则列出当前登录用户管理的公司，否则列出userid对应的用户管理的公司
        // state:this.state.currentTabState,
        state:"1"
      },
    }).then(()=>{
      //若用户是管理员且没有管理的企业，则显示添加企业页面
      const {records} = this.props.company.data;
      //加入判断，如果当前用户没有管理的企业且当前用户是管理员则显示添加企业页面
      if((!records || records.length<1) && userIsAdmin) {
        this.props.history.push("/home/nocompany");
      }
    });

    //请求manager列表
    this.props.dispatch({
      type:'company/allManagers',
    })

    // 请求工资异常数据
    this.props.dispatch({
      type:'salaryHistoryDetail/errorList',
      payload:{}
    })

    // 请求工资异议数据
    this.props.dispatch({
      type:'salaryDissent/list',
      payload:{
        state:"1",  //只列出有未处理异议的的记录
      }
    });
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
   * 提交回复内容
   */
  handleAddCompany = (values,form) => {
    const fileList = this.state.fileList;
    //没选择模版文件的话就提示选择模版文件
    if(!values.templateFile || !fileList || fileList.length<1) {
      message.error("请选择模版文件！");
      return;
    }
    //调用dispatch，执行effect提交表单信息，然后在effect中执行modal的关闭操作，把服务器返回的状态设置到state中，在这里读取那个state根据它来决定显示添加成功的modal还是添加失败的modal
    var formData = new FormData();
    formData.append('name', values.name);
    formData.append('managerId',values.managerId);
    formData.append('templateFile',fileList[0]);

    this.props.dispatch({
      type:'company/save',
      payload: {formData}, //尝试用 FormData 传文件
    }).then(()=>{
      this.setState({companyModalVisible:false,fileList:[]});
      form.resetFields();
      this.handleRefresh()
    })
  }

  /**
   * 渲染 模版文件说明 的 modal
   */
  renderTemplateInfo = () => {
    Modal.info({
      title:"工资条模版说明",
      content:(
        <div>
          <p style={{color:"grey"}}>您可以将您目前的工资条删除数据，仅保留表头，为了保证系统可以正常识别，并且可以正常发放工资，请确认您的模板符合以下要求：</p>
          <p>1. 表头位于表格中的第一行；</p>
          <p>2.  表头中必须包含“姓名”、“身份证号”、“实发工资”，<span style={{color:'red'}}>以上字段中，汉字需严格对应，否则无法正常添加！</span></p>
        </div>
      ),
      onOk(){},
    })
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

  /**
   * 渲染上传组件
   */
  renderUploadComponent=() => {
    const {fileList} = this.state;
    return (<Upload {...this.uploadProps}>
      <Button type="primary">
        <Icon type="upload"/> {"请选择工资条模版"}
      </Button>
      {fileList&&fileList.length>0&&fileList.map(file=>{
        return <span key=""> 已选择文件：<span className={formStyles.uploadFileNameText}>{file.name}</span></span>
      })}
    </Upload>)
  }

  renderSelectManager=()=>{
    const { allManagers } = this.props.company;
    return (
      <Select style={{width:"100%"}}>
        {allManagers.map(manager => <Option value={manager.id} key={manager.id}>{manager.realName}</Option>)}
      </Select>
    )
  }
  /**
   * 点击处理记录时调用的function
   * @param record
   */
  handleReply = (record) => {
    //请求异议内容，modal中显示当前异议内容，提示可以点击详情查看沟通记录
    //获取异议回复
    this.props.dispatch({
      type:'salaryDissentDetail/get',
      payload:{
        salaryId:record.id,
      }
    }).then(()=>{
      const {salaryDissentList:list} = this.props.salaryDissentDetail.data;
      list&&list.length>0&&this.setState({currentDissentItem:list[list.length-1],dissentReplyModalVisible:true});  //设置回复框默认回复的记录为最新(当前)的异议，后端需要按异议创建时间升序排序
    });
  }
  /**
   * 切换tab时的触发的钩子函数
   * @param activeKey
   */
  handleTabChange = (activeKey) => {
    //更新当前活动Tab的state
    this.setState({currentActiveKey:activeKey});
    //请求工资历史数据
    if(activeKey==="1") {
      this.props.dispatch({
        type: 'company/resentSalaryList',
        payload: {
          managerId: '',  //userid为null则列出当前登录用户管理的公司，否则列出userid对应的用户管理的公司
          state:'1'
        },
      });
    } else if(activeKey==="2") {
      // 请求工资历史详情
      this.props.dispatch({
        type:'salaryHistoryDetail/errorList',
      })
    }else {
      // 请求工资异议数据
      this.props.dispatch({
        type:'salaryDissent/list',
        payload:{
          state:"1",  //只列出有未处理异议的的记录
        }
      });
    }
  }

  /**
   * 处理表格的分页，过滤，排序器
   */
  handleTableChange = (pagination, filtersArg, sorter) => {
    const {dispatch,formModel:{formValues}} = this.props;
    const {currentActiveKey} = this.state;
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
    if(currentActiveKey=="1") {
      dispatch({
        type: 'company/resentSalaryList',
        payload: {
          ...params,
          managerId: '',  //userid为null则列出当前登录用户管理的公司，否则列出userid对应的用户管理的公司
          state:'1'
        },
      });
    }else if(currentActiveKey=="2") {
      dispatch({
        type: 'salaryHistoryDetail/errorList',
        payload:{
          ...params
        }
      });
    }else if(currentActiveKey=="3"){
      dispatch({
        type: 'salaryDissent/list',
        payload: {
          ...params,
          state:"1",  //只列出有未处理异议的的记录
        },
      });
    }
  }

  /**
   * 提交回复内容
   */
  submitReply = (values) => {
    //调用dispatch，执行effect提交回复的信息
    this.props.dispatch({
      type: 'salaryDissentDetail/save',
      payload: {
        id:this.state.currentDissentItem.id,
        salaryId:this.state.currentDissentItem.salaryId,
        replyContent:values.replyContent
      },
    }).then(() => {
      this.handleRefresh();
    });
  }

  /**
   *点击处理记录时调用的function
   */
  switchStatus = (record) => {
    //反转record的status，调用effect传给后台
    const newState = !(record.state==="1");
    this.props.dispatch({
      type:'company/updateState',
      payload:{
        companyId:record.id,
        companyStatus:newState,
        state:newState?1:0,
      }
    }).then(()=>this.handleRefresh());
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

  /**
   * 渲染历史记录表格
   */
  renderRecentPaySalaryTable = () =>{
    const {company:{data}, loading}= this.props;
    const columns =[
      {
        title: '序号',
        key: 'index',
        render(text, record, index) {
          return <span>{(data.current-1)*data.size+index+1}</span>
        }
      },
      {
        title: '企业名称',
        dataIndex: 'name',
        key: 'name',
        width: '220px'
      },
      {
        title: '上次发工资日',
        dataIndex: 'salaryBatch.uploadTime',
        kay: 'payday',
        render: val => <span>{val&&moment(val).format('YYYY-MM-DD')}</span>,
      },
      {
        title: '上次发工资人数',
        dataIndex: 'salaryBatch.totalCount',
        key: 'totalPeople',
      },
      {
        title: '上次发工资成功人数',
        dataIndex: 'salaryBatch.successCount',
        key: 'successCount',
      },
      {
        title: '上次发工资失败人数',
        dataIndex: 'salaryBatch.failCount',
        key: 'failCount',
      },
      {
        title: '上次发工资金额（元）',
        dataIndex: 'salaryBatch.totalMoney',
        key: 'totalMoney',
        align: 'right',
        render: (val) => {
          return numeral(val).format('0,0.00');
        }
      },
      {
        title: '负责人',
        dataIndex: 'manager.realName',
        key: 'managerName',
      },
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        render:(text,record)=>{
          return text==="1"?'正常':'停用'
        }
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            {/*<Link to={'/settings/company/detail/'+record.id}>详情</Link> <Divider type="vertical" />*/}
            { record.salaryBatch ?
              <span>
                <Link to={'/salary/salaryHistory/detail/'+record.salaryBatch.id+'/'+record.id}>详情</Link>
              </span> : ''
            }
            {/*<a onClick={()=>{this.switchStatus(record)}}>{record.state==="1"?'关闭':'开启'}</a>*/}
          </Fragment>
        ),
      },];

    return(
      <div>
        <StandardTable
          loading={loading}
          data={data}
          columns={columns}
          onChange={this.handleTableChange}
        />
      </div>
    )
  }

  renderSalaryExceptionTable=()=>{
    const {salaryHistoryDetail:{data}, loading}= this.props;
    const columns =[
      {
        title: '姓名',
        dataIndex: 'emp.name',
      },
      {
        title: '公司',
        dataIndex: 'company.name',
      },
      {
        title: '发工资月份',
        dataIndex: 'createTime',
        render: val => <span>{moment(val).format('YYYY-MM')}</span>,
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
        dataIndex: 'emp.wechatState',
        render:(text)=>{
          return text=="1"?"认证成功":"待认证"
        }
      },
      {
        title: '发放状态',
        dataIndex: 'state',
        render:(text)=>{
          // 0待发薪 1发放中 2发放成功 3发放失败
          if(text=="0")
            return "待发薪";
          if(text=="1")
            return "发放中";
          if(text=="2")
            return "发薪成功";
          if(text=="3")
            return <span style={{color:'red'}}>发薪失败</span>;
        }
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <a onClick={() => { this.renderSalaryTicket(record) }}>查看详情</a>
          </Fragment>
        ),
      },];

    return(
      <div>
        <StandardTable
          loading={loading}
          data={data}
          columns={columns}
          onChange={this.handleTableChange}
        />
      </div>
    )
  }

  renderSalaryDissentTable = () =>{
    const {salaryDissent:{data}, loading}= this.props;  //正式上线时使用的语句
    //具体的 dataIndex 等之后写逻辑时在改成和后端传来的内容一致的字段名，目前先占位即可
    const columns =[
      {
        title: '记录编号',
        dataIndex: 'id',
        key: 'id',
        sorter: true,
      },
      {
        title: '公司',
        dataIndex: 'company.name',
        key: 'company',
      },
      {
        title: '姓名',
        dataIndex: 'emp.name',
        key: 'empName',
      },
      {
        title: '发工资月份',
        dataIndex: 'salaryMonth',
        key: 'salaryMonth',
        render:(text,record)=>{
          const{startDate,endDate} = record;
          return startDate==endDate?startDate:startDate+"-"+endDate
        }
      },
      {
        title: '身份证号',
        dataIndex: 'emp.idcard',
        key: 'empIdCard',
      },
      {
        title: '发放金额（元）',
        dataIndex: 'salary',
        key: 'salary',
        align: 'right',
        render: (val) => {
          return numeral(val).format('0,0.00');
        }
      },
      {
        title: '状态',
        dataIndex: 'dissentState',
        key: 'dissentState',
        render:(text)=>{
          return text=="2"?"已处理":"未处理"
        }
      },
      {
        title: '发薪时间',
        dataIndex: 'createTime',
        key: 'createTime',
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '处理人',
        dataIndex: 'replyUser.realName',
        key: 'replyUser',
      },
      {
        title: '处理时间',
        dataIndex: 'replyTime',
        key: 'replyTime',
        render: val => <span>{val ? moment(val).format('YYYY-MM-DD HH:mm:ss'):''}</span>,
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
           <Link to={'/salary/salaryDissent/detail/'+record.id}>查看异议详情</Link>
           {/*<a onClick={()=>{this.handleReply(record)}}> {record.dissentState=="1"?"处理":"修改回复"}</a>*/}
          </Fragment>
        ),
      },];
    return(
      <div>
        <StandardTable
          loading={loading}
          data={data}
          columns={columns}
          onChange={this.handleTableChange}
        />
      </div>
    )
  }

  render() {
    const {stat:{ companyValidCount, empValidCount, salaryStatLastMonthData, salaryStatData }, loading, salaryLoading} = this.props;
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

    const {companyModalVisible} = this.state;
    const addCompanyModalParams={
      modalVisible:companyModalVisible,
      modalTitle:'添加企业',
      modalContent:"",
      handleCancel:()=>{this.setState({companyModalVisible:false,fileList:[]})},
      modalFooterText:"确定",
      handleOk:this.handleAddCompany,
      renderUploadComponent:this.renderUploadComponent,
      renderTemplateInfo:this.renderTemplateInfo,
      renderSelectManager:this.renderSelectManager,
      companyManagerList:this.props.company.companyManagerList,
      loading,
    };
    const {dissentReplyModalVisible} = this.state;
    const replyDissentModalParams = {
        modalVisible:dissentReplyModalVisible,
        currentItem:this.state.currentDissentItem,
        handleCancel:()=>this.setState({dissentReplyModalVisible:false}),
        submitReply:this.submitReply,
    }

    return (
      <div>
        <Card title="经营看板" bordered={false}>
          <Row>
            <Col md={4} sm={12} xs={24}>
              <NumberInfo
                subTitle="合作用工企业"
                suffix="家"
                total={companyValidCount}
              />
            </Col>
            <Col md={4} sm={12} xs={24}>
              <NumberInfo
                subTitle="工人总数"
                suffix="人"
                total={empValidCount} />
            </Col>
            <Col md={4} sm={12} xs={24}>
              <NumberInfo
                subTitle="上月平均工资"
                suffix="元"
                total={salaryStatLastMonthData&&salaryStatLastMonthData.avgMoney?numeral(salaryStatLastMonthData.avgMoney).format('0,0.00'):'0.00'}
              />
            </Col>
            <Col md={4} sm={12} xs={24}>
              <NumberInfo
                subTitle="上月发薪总额"
                suffix="元"
                total={salaryStatLastMonthData&&salaryStatLastMonthData.sumMoney?numeral(salaryStatLastMonthData.sumMoney).format('0,0.00'):'0.00'}
              />
            </Col>
            <Col md={4} sm={12} xs={24}>
              <NumberInfo
                subTitle="上月单日最高发薪金额"
                suffix="元"
                total={salaryStatLastMonthData&&salaryStatLastMonthData.maxMoney?numeral(salaryStatLastMonthData.maxMoney).format('0,0.00'):''}
              />
            </Col>
          </Row>
        </Card>

        <Card loading={salaryLoading} bordered={false} bodyStyle={{ padding: 0, marginTop:24 }}>
          <div className={styles.salesCard}>
            <Tabs size="large" tabBarStyle={{ marginBottom: 24 }}>
              <TabPane tab="发薪金额" key="money">
                <div className={styles.salesBar}>
                  <Bar height={292} title="发薪金额" data={salaryStatData['salarys']} />
                </div>
              </TabPane>
              <TabPane tab="发薪人数" key="emp">
                <div className={styles.salesBar}>
                  <Bar height={295} title="发薪人数" data={salaryStatData['emps']} />
                </div>
              </TabPane>
            </Tabs>
          </div>
        </Card>

        <Card bordered={false} bodyStyle={{ padding: 24, marginTop:24 }}>
          <Tabs defaultActiveKey={this.state.currentActiveKey} onChange={this.handleTabChange}>
            <TabPane tab="最近工资发放情况" key="1">{this.renderRecentPaySalaryTable()}</TabPane>
            <TabPane tab="工资发放异常提醒" key="2">{this.renderSalaryExceptionTable()}</TabPane>
            <TabPane tab="工资异议" key="3">{this.renderSalaryDissentTable()}</TabPane>
          </Tabs>
        </Card>

        <CreateForm
          {...modalParams}
        />
        <AddCompanyModal
          {...addCompanyModalParams}
        />
        <ReplyDissentModal
          {...replyDissentModalParams}
        />
    </div>);
  }
}
