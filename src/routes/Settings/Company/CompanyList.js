import React, {PureComponent} from 'react';
import { Card, Form, Input, Select, Icon, Button, Upload, Modal, Tooltip, Divider } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import numeral from 'numeral';
import {cons} from '../../../common/constant';
import StandardTable from '../../../components/StandardTable';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from '../../../assets/less/List.less';
import formStyles from '../../../assets/less/Form.less';
import flowRecord from './../../../utils/flowRecord'

const FormItem = Form.Item;
const { Option } = Select;
let fileList = [];

/**
 * 定义 modal 弹出窗口组件
 */
const CreateForm = Form.create()((props) => {
  const { modalVisible, currentItem, handleCheckCompanyName, handleOk, handleCancel, renderTemplateInfo, allManagers, form } = props;
  const { getFieldDecorator } = form;

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

  const handleCheckFile = (rule, value, callback) => {
    if (!currentItem.id && !value ) {
      callback('请选择工资模板！');
    }
    callback();
  };
  //上传组件需要的参数
  const uploadProps = {
    name:'templateFile',
    accept: ".xls,.xlsx",
    action: '/api/company/save',
    showUploadList:false,
    beforeUpload: file => {
      fileList=[];
      fileList.push(file);
      return false;  //返回假，禁用上传组件的自动上传
    },
  };

  return (
    <Modal
      title={currentItem.id ? '编辑企业':'添加企业'}
      visible={modalVisible}
      onCancel={onCancel}
      onOk={onOk}
    >
      <FormItem
        labelCol={{span: 5}}
        wrapperCol={{span: 15}}
        label="企业名称"
      >
        {getFieldDecorator('name', {
          initialValue: currentItem.name,
          rules: [{
            validator: handleCheckCompanyName,
          }],
        })(
          <Input placeholder="请输入企业名称"/>
        )}
      </FormItem>
      <FormItem
        labelCol={{span: 5}}
        wrapperCol={{span: 15}}
        label="负责人"
      >
        {getFieldDecorator('managerId',{
          initialValue: currentItem.managerId,
          rules:[{
            required: true, message: '请选择企业负责人'
          }]
        })(
          <Select placeholder="请选择">
            {allManagers.map(manager => <Option value={manager.id} key={manager.id}>{manager.realName}</Option>)}
          </Select>
        )}
      </FormItem>
      <FormItem
        labelCol={{span: 5}}
        wrapperCol={{span: 16}}
        label={<span>选择模版 <Tooltip title="点击查看工资条模板说明"><Icon className={formStyles.infoIcon} onClick={renderTemplateInfo} type="info-circle-o" /></Tooltip></span>}
      >
        {getFieldDecorator('templateFile', {
          rules:[{
            validator: handleCheckFile
          }]
        })(
          <span>
            <Upload {...uploadProps}>
              <Button type="primary">
                <Icon type="upload"/> {currentItem.id ? '修改工资条模版':'请选择工资条模版'}
              </Button>
              {fileList&&fileList.length>0&&fileList.map(file=>{
                return <div key=""> 已选择文件：<span className={formStyles.uploadFileNameText}>{file.name}</span></div>
              })}
             </Upload>
          </span>
        )}
      </FormItem>
    </Modal>
  )
});

@connect(({company,formModel,modalModel,loading}) => ({
  formModel,
  modalModel,
  company,
  loading: loading.models.company,
}))
@Form.create()
export default class CompanyList extends PureComponent {
  state = {
    tabValues: { state: '1' },
    managerId: ''
  };
  componentWillMount() {
    flowRecord();
  }
  componentDidMount(){
    const { dispatch, match } = this.props;
    const managerId = match.params.managerId?match.params.managerId:'';
    const path = match.path;

    this.setState({
      managerId: managerId,
    });

    //如果路径是添加路径，直接弹出添加企业的modal
    if(path&&path==='/settings/company/add') {
      this.handleEdit();
    }

    //请求数据
    dispatch({
      type:'company/list',
      payload: {
        ...this.state.tabValues,
        managerId: managerId,
      }
    });

    //请求manager列表
    dispatch({
      type:'company/allManagers',
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
          <p>2. 模板字段要求：<br/>
            （1）使用京东金融发薪的模板：<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;表头中必须包含“姓名”、“身份证号”、“实发工资”<br/>
            （2）使用平安银行发薪的模板：<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;表头中必须包含“姓名”、“身份证号”、“银行卡号”、“手机号”、“实发工资”
            <br/>
            <span style={{color:'red'}}>PS：以上字段中，汉字需严格对应，否则无法正常添加！</span></p>
        </div>
      ),
      onOk(){},
    })
  }

  handleCheckCompanyName = (rule, value, callback) => {
    value = value ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, ''):'';
    if (!value) {
      return callback("请输入企业名称！");
    }
    this.props.dispatch({
      type: 'company/check',
      payload: {
        name: value
      }
    }).then(response => {
      if (response.code === 0) {
        callback();
      } else {
        callback(response.msg);
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
  handleOk = (values) => {
    const {modalModel: { currentItem }} = this.props;
    let formData = new FormData();
    values.name = values.name ? values.name.replace(/^\s\s*/, '').replace(/\s\s*$/, ''):'';
    currentItem.name = values.name;
    currentItem.managerId = values.managerId;
    formData.append('name', values.name);
    formData.append('managerId',values.managerId);
    if(fileList.length>0) {
      formData.append('templateFile',fileList[0]);
    }
    this.props.dispatch({
      type:'company/save',
      payload: {formData}, //用 FormData 传文件
    }).then(()=>{
      this.handleCancel()
      this.handleRefresh()
    })
  }

  /**
   * 重新请求数据
   */
  handleRefresh = () => {
    const {dispatch} = this.props;
    dispatch({
      type: 'company/list',
      payload: {
        ...this.state.tabValues,
        managerId: this.state.managerId
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
      type: 'company/list',
      payload: {
        ...params,
        ...this.state.tabValues,
        managerId: this.state.managerId
      },
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

  handleTabChange=(activeKey)=>{
    this.setState({
      tabValues: { state: activeKey }
    }, this.handleRefresh);
  }

  /**
   * 处理添加操作
   */
  handleEdit = (record = {}) => {
    fileList=[];
    this.props.dispatch({
      type:'modalModel/showModal',
      payload: record
    })
  }

  handleDownload = (record) => {
    location.href = `${cons.url.base_url}/salary/template/download?companyId=${record.id}`;
  }

  render() {
    const {modalModel: { modalVisible, currentItem }, company:{ allManagers, data }, loading} = this.props;

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
        key: 'payday',
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
          return val&&numeral(val).format('0,0.00');
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
          <div style={{display:'flex',flexWrap:'wrap'}}>
            <Link to={'/settings/company/emps/'+record.id}>员工列表</Link> <Divider type="vertical" />
            <Link to={'/settings/company/detail/'+record.id}>发薪记录</Link> <Divider type="vertical" />
            <a onClick={()=>{this.handleEdit(record)}}>编辑</a> <Divider type="vertical" />
            <a onClick={()=>{this.handleDownload(record)}}>下载模板</a>
            {/*<a onClick={()=>{this.switchStatus(record)}}>{record.state==="1"?'关闭':'开启'}</a>*/}
          </div>
        ),
      },];

    const modalParams={
      modalVisible,
      currentItem,
      allManagers: allManagers,
      handleCancel: this.handleCancel,
      handleOk: this.handleOk,
      renderTemplateInfo: this.renderTemplateInfo,
      handleCheckCompanyName: this.handleCheckCompanyName,
    }

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleEdit()}>
                添加
              </Button>
            </div>
            {/*<Tabs defaultActiveKey="1" onChange={this.handleTabChange}>*/}
              {/*<TabPane tab="正常" key="1"></TabPane>*/}
              {/*<TabPane tab="关闭" key="0"></TabPane>*/}
              {/*<TabPane tab="全部" key=""></TabPane>*/}
            {/*</Tabs>*/}
            <StandardTable
              loading={loading}
              data={data}
              columns={columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
          <CreateForm
            {...modalParams}
          />
          </Card>
      </PageHeaderLayout>
      )
  }
}
