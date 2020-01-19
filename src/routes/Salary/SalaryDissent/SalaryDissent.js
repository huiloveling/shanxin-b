import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import moment from 'moment';
import numeral from 'numeral';
import { Card, Row, Col, Form, Input, Button, Modal,Tabs, Divider } from 'antd';
import styles from '../../../assets/less/List.less';
import StandardTable from '../../../components/StandardTable';
import flowRecord from './../../../utils/flowRecord'

const {TextArea} = Input;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

//定义 modal 弹出窗口组件
const CreateForm = Form.create()((props) => {
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

@connect(({salaryDissent, salaryDissentDetail, formModel, modalModel, loading}) => ({
  formModel,
  modalModel,
  salaryDissent,
  salaryDissentDetail,
  loading: loading.models.salaryDissent,
}))
@Form.create()
export default class SalaryDissent extends PureComponent {
  state = {
    currentTab:"1",
    currentItem:{}, //当前编辑的异议记录
  }

  componentWillMount() {
    flowRecord();
    this.props.dispatch({
      type:'salaryDissent/list',
      payload: {
        state:this.state.currentTab,
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
  submitReply = (values) => {
    //调用dispatch，执行effect提交回复的信息
    this.props.dispatch({
      type: 'salaryDissentDetail/save',
      payload: {
        id:this.state.currentItem.id,
        salaryId:this.state.currentItem.salaryId,
        replyContent:values.replyContent
      },
    }).then(() => {
      this.handleRefresh();
    });
  }

  /**
   * 重新请求数据，state改变，页面会自动刷新
   */
  handleRefresh = () => {
    const {dispatch} = this.props;
    dispatch({
      type: 'salaryDissent/list',
      payload:{
        state:this.state.currentTab,
      }
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
      type: 'salaryDissent/list',
      payload: {
        ...params,
        state:this.state.currentTab,
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
      type:'formModel/setFormValues',
      payload: {formValues: {}},
    });
    dispatch({
      type: 'salaryDissent/list',
      payload: {
        state:this.state.currentTab,
      }
    });
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
      list&&list.length>0&&this.setState({currentItem:list[list.length-1]});  //设置回复框默认回复的记录为最新(当前)的异议，后端需要按异议创建时间升序排序
      this.props.dispatch({
        type:'modalModel/showModal',
        payload:this.state.currentItem,   //这个state能不能取到刚刚设置的currentItem还有待测试
      });
    });
  }

  /**
   * 处理历史记录页面查询的函数
   * @param e
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
      // 设置formValue(貌似不用设这个，好像没用到
      dispatch({
        type:'formModel/setFormValues',
        payload: {formValues: values},
      });
      // 向服务器请求数据
      dispatch({
        type:'salaryDissent/list',
        payload: {
          keyword:values.keyword,
          state:this.state.currentTab,
        },
      });
    });
  }

  handleTabChange=(activeKey)=>{
    this.setState({currentTab:activeKey});
    this.props.dispatch({
      type:'salaryDissent/list',
      payload:{
        state:activeKey,
      }
    })
  }


  render() {
    const {getFieldDecorator} = this.props.form;
    const {salaryDissent:{data}, loading}= this.props;  //正式上线时使用的语句
    //表格列信息
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

    const {modalModel: {modalVisible}} = this.props;
    const modalParams={
      modalVisible,
      currentItem:this.state.currentItem,
      handleCancel:this.handleCancel,
      submitReply:this.submitReply,
    }

    return (
        <Card bordered={false}>
          {/*搜索栏*/}
          <Form onSubmit={this.handleSearch} layout="inline">
            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
              <Col md={6} sm={18}>
                <FormItem label="姓名或身份证号">
                  {getFieldDecorator('keyword')(
                    <Input style={{ width: '200px' }} placeholder="请输入"/>
                  )}
                </FormItem>
              </Col>
              <Col md={6} sm={18}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{marginLeft: 8, marginTop:4}} onClick={this.handleSearchReset}>重置</Button>
            </span>
              </Col>
            </Row>
          </Form>
          {/*Tab*/}
          <Tabs defaultActiveKey={this.state.currentTab} onChange={this.handleTabChange}>
            <TabPane tab="未处理" key="1"> </TabPane>
            <TabPane tab="已处理" key="2"> </TabPane>
            <TabPane tab="全部" key="3"> </TabPane>
          </Tabs>
          {/*表格*/}
          <StandardTable
            loading={loading}
            data={data}
            columns={columns}
            onChange={this.handleStandardTableChange}
          />
          {/*modal*/}
          <CreateForm
            {...modalParams}
          />
        </Card>
    )
  }
}
