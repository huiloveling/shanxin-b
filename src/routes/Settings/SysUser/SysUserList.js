import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import { Card, Form, Input, Select, Button, Modal, Transfer, Divider } from 'antd';
import { userInfoUtil } from '../../../utils/UserInfoUtil';
import StandardTable from '../../../components/StandardTable';

import styles from '../../../assets/less/List.less';
import flowRecord from './../../../utils/flowRecord'

const FormItem = Form.Item;
const {Option} = Select;

const CreateForm = Form.create()((props) => {
  const {modalVisible,handleCancel,modalTitle, handleOk, renderAdminSubAccDiff,transferModal, form} = props;
  const {getFieldDecorator} = form;

  const onOk = () =>{
    form.validateFields((err,fieldsValue)=>{
      if(err) return;
      form.resetFields(); //重置表单，避免第二次弹出modal时依然有当前的内容
      handleOk(fieldsValue)
    })
  }

  const onCancel = () => {
    handleCancel();
    form.resetFields();
  }

  return (
    <Modal
      title={modalTitle}
      visible={modalVisible}
      width={'700px'}
      onCancel={onCancel}
      onOk={onOk}
      footer={<div><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={onOk}>确定</Button></div>}
    >
      <FormItem
        labelCol={{span: 5}}
        wrapperCol={{span: 15}}
        label="真实姓名"
      >
        {getFieldDecorator('realName',{
          rules: [
            { required: true, message: '请输入真实姓名！', },
          ],
        })(
          <Input placeholder="请输入真实姓名"/>
        )}
      </FormItem>
      <FormItem
        labelCol={{span: 5}}
        wrapperCol={{span: 15}}
        label="角色类型"
      >
        {getFieldDecorator('type',{
          initialValue:'2'
        })(
          <Select style={{width:"120px"}}  placeholder="请选择" >
            <Option value="1">管理员</Option>
            <Option value="2">子账号</Option>
          </Select>
        )}
        <a onClick={renderAdminSubAccDiff}>&nbsp;管理员和子账号有何分别?</a>
      </FormItem>
      <FormItem
        labelCol={{span: 5}}
        wrapperCol={{span: 15}}
        label="用户名"
      >
        {getFieldDecorator('username', {
          rules: [
            { required: true, message: '请输入用户名！', },
          ],
        })(
          <Input placeholder="请输入用户名"/>
        )}
      </FormItem>
      <FormItem
        labelCol={{span: 5}}
        wrapperCol={{span: 15}}
        label="手机号"
      >
        {getFieldDecorator('phone',{
          rules: [
            { required: true, message: '请输入手机号！', },
            { pattern: /^1\d{10}$/, message: '手机号格式错误！', },
          ],
        })(
          <Input placeholder="11位手机号"/>
        )}
      </FormItem>
      <FormItem
        labelCol={{span: 5}}
        wrapperCol={{span: 15}}
        label="密码"
      >
        {getFieldDecorator('password', {
          rules: [
            { required: true, message: '请输入密码！', },
          ],
        })(
          <Input type="password" placeholder="密码"/>
        )}
      </FormItem>
      <FormItem
        labelCol={{span: 5}}
        wrapperCol={{span: 15}}
        label="负责的企业"
      >
        {transferModal()}
      </FormItem>
    </Modal>
  )
});

@connect(({sysuser,company,formModel,modalModel,loading}) => ({
  formModel,
  modalModel,
  sysuser,
  company,
  loading: loading.models.sysuser,
}))
@Form.create()
export default class SysUserList extends PureComponent {

  state={
    tabValues: {
      state: '1'
    },
    visible:false,
    currentUser:{}
  }  //visible 是控制 '选择企业的 modal 是否可见' 的flag

  loginUser={};
  componentWillMount() {
    flowRecord();
  }
  componentDidMount() {
    //获取公司列表
    this.props.dispatch({
      type:'sysuser/fetchCompanyList',
    });
    this.handleRefresh();
  }

  /**
   * 选择公司的穿梭框的过滤器使用的方法
   */
  filterOption = (inputValue, option) => {
    return option.title.indexOf(inputValue) > -1;  //直接根据条目的title来筛选，如果title包含筛选框的字段，就显示此条目
  }

  /**
   * 穿梭框的选择了条目后执行的回调方法
   * @param targetKeys
   */
  handleTargetKeysChange=(targetKeys)=>{
    //设置targetKeys
    this.props.dispatch({
      type:'sysuser/setTargetKeys',
      payload:{
        targetKeys:targetKeys
      }
    });
  }

  /**
   * 渲染 模版文件说明 的 modal
   */
  renderAdminSubAccDiff = () => {
    Modal.info({
      title:"管理员和子账号有什么区别？",
      content:(
        <div>
          <p>管理员：拥有全部权限</p>
          <p>子账号：可以对企业发工资，但是无法操作财务和系统设置</p>
        </div>
      ),
      onOk(){},

    })
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
   * @param values
   */
  handleOk = (values) => {
    //调用dispatch，执行effect提交表单信息，然后在effect中执行modal的关闭操作
    this.props.dispatch({
     type: 'sysuser/save',
     payload: {
       bizUser:{
         ...values,
         bizCustomer:{
           id:userInfoUtil.getCurrentUser().bizCustomer.id,
         }
       },
       companyIds:this.props.sysuser.targetKeys, //在这里把表单内容以及state中的targetKeys一并发出去，targetKeys对应选择了的企业
     },
    }).then(() => this.handleRefresh());
  }

  handleRefresh = () => {
    const {dispatch} = this.props;
    //获取用户列表
    dispatch({
      type: 'sysuser/list',
      payload:{
        ...this.state.tabValues
      }
    });
  }

  /**
   * 处理表格的分页，过滤，排序器
   * @param pagination
   * @param filtersArg
   * @param sorter
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
      type: 'sysuser/list',
      payload: params,
    });
  }

  /**
   * 点击处理记录时调用的function
   * @param record
   */
  switchStatus = (record) => {
    //反转record的status，调用effect传给后台
    this.props.dispatch({
      type:'sysuser/updateState',
      payload:{
        id:record.id,
        state:record.state=="1"?'0':'1'
      }
    }).then(()=>this.handleRefresh())
  }

  resetPasswordConfirm = (userId,resetPassword) => {
    Modal.confirm({
      title: '重置密码确认',
      content: '将会把当前选中用户的密码重置为 "123456"（不包含双引号）您确定吗？',
      onOk() {resetPassword(userId)},
      onCancel() {}
    });
  }

  resetPassword = (userId)=> {
    this.props.dispatch({
      type:'sysuser/resetPassword',
      payload:{
        userId: userId,
      }
    });
  }

  /**
   * 点击添加用户时执行的回调函数
   */
  handleAdd = () => {
    this.props.dispatch({
      type:'modalModel/showModal',
      payload:{
        modalTitle: "添加用户",
        modalContent: "",
        modalFooterText:'确定',}
    })
  }

  /**
   * 切换tab时的触发的钩子函数
   * @param activeKey
   */
  handleTabChange = (activeKey) => {
    this.setState({
      tabValues: {
        state: activeKey,
      }
    }, this.handleRefresh);
  }


  handleTransferSelectChange = () => {
    console.log("selectChange...")
  }
  /**
   * 渲染选择公司的穿梭框
   * @returns {JSX}
   */
  renderChooseCompayTransfer=()=>{
    const {companyList,targetKeys} = this.props.sysuser;
    const dataSource = [];
    //将数据整理为transer使用的结构
    if(companyList) {
      companyList.map(item=>{
        let temp = {
          key:item.id+"",
          title:item.name,
          description:item.name,
        }
        dataSource.push(temp);
      });
    }
    return (<Transfer
      dataSource={dataSource}
      filterOption={this.filterOption}
      targetKeys={targetKeys}
      onChange={this.handleTargetKeysChange}
      onSelectChange={this.handleTransferSelectChange}
      titles={['可选企业','已选企业']}
      render={item => item.title}
    />)
  }

  render() {
    const {sysuser:{data}, loading}= this.props;  //正式上线时使用的语句
    //具体的 dataIndex 等之后写逻辑时在改成和后端传来的内容一致的字段名，目前先占位即可
    //表格使用的列名，死的，而且重复的，因此直接定义成类变量，所有表格共用
    const columns =[
      {
        title: '序号',
        render(text, record, index) {
          return <span>{(data.current-1)*data.size+index+1}</span>
        }
      },
      {
        title: '姓名',
        dataIndex: 'realName',
        key: 'realName',
      },
      {
        title: '角色',
        dataIndex: 'type',
        key: 'type',
        render:(text)=>{
          return text=="1"?"管理员":"子账户"
        }
      },
      {
        title: '用户名',
        dataIndex: 'username',
        key: 'userename',
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        key: 'phone',
      },
      {
        title: '添加人',
        dataIndex: 'createUsername',
        key: 'createUsername',
      },
      {
        title: '添加时间',
        dataIndex: 'createTime',
        key: 'createTime',
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        render:(text)=>{
          return text=="1"?"启用":"禁用"
        }
      },
      {
        title: '操作',
        key:"operation",
        render: (text, record) => (
          <Fragment>
            <Link to={'/settings/company/manager/'+record.id}>他的企业</Link> <Divider type="vertical" />
            <a onClick={()=>{this.resetPasswordConfirm(record.id,this.resetPassword)}}>重置密码</a>
            {/*<a onClick={()=>this.switchStatus(record)}>{record.state=="1"?'停用':'启用'}</a>*/}
          </Fragment>
        ),
      },];

    const {modalModel: {modalVisible,modalTitle,modalContent,modalFooterText}} = this.props;
    const modalParams={
      modalVisible,
      modalTitle,
      modalContent,
      handleCancel:this.handleCancel,
      modalFooterText,
      handleOk:this.handleOk,
      renderUploadComponent:this.renderUploadComponent,
      renderAdminSubAccDiff:this.renderAdminSubAccDiff,
      transferModal:this.renderChooseCompayTransfer,
    }
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button  icon="plus" type="primary" onClick={this.handleAdd}>添加</Button>
            </div>
            {/*<Tabs defaultActiveKey="1" onChange={this.handleTabChange}>*/}
              {/*<TabPane tab="启用" key="1"></TabPane>*/}
              {/*<TabPane tab="停用" key="0"></TabPane>*/}
              {/*<TabPane tab="全部" key=""></TabPane>*/}
            {/*</Tabs>*/}
            <StandardTable
              loading={loading}
              data={data}
              columns={columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
          {/*modal*/}
          <CreateForm
            {...modalParams}
          />
        </Card>
      </div>
    )
  }
}
