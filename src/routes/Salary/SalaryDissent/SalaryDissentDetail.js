import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import moment from 'moment';
import {Card, Row, Col, Form, Input, Button, Modal, Divider} from 'antd';
import styles from '../../../assets/less/List.less';
import salaryStyle from './SalaryDissent.less';
import DescriptionList from '../../../components/DescriptionList';
import flowRecord from './../../../utils/flowRecord'

const {TextArea} = Input;
const {Description} = DescriptionList;
const FormItem = Form.Item;

//定义 modal 弹出窗口组件
const CreateForm = Form.create()((props) => {
  const {modalVisible, handleCancel, currentItem, submitReply, form} = props;
  const {getFieldDecorator} = form;

  const handleOk = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleCancel();
      form.resetFields(); //重置表单，避免第二次弹出modal时依然有当前的内容
      submitReply(fieldsValue)
    })
  }

  const onCancel = () => {
    handleCancel();
    form.resetFields();
  }


  const handleCheckReplyContent = (rule, value, callback) => {
    if (value == null || value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') === '') {
      callback("请输入回复内容");
    } else {
      callback();
    }
  }

  return (
    <Modal
      title={"编辑回复信息"}
      visible={modalVisible}
      onCancel={onCancel}
      onOk={handleOk}
      footer={<div><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleOk}>回复</Button></div>}
    >
      <FormItem key="1">
        {getFieldDecorator('replyContent', {
          initialValue: currentItem.replyContent,
          rules:[{
            validator: handleCheckReplyContent,
          }]
        })(
          <TextArea rows={6} placeholder="请输入回复内容"/>
        )}
      </FormItem>
    </Modal>
  )
});

@connect(({salaryDissentDetail, salaryHistoryDetail, modalModel, loading}) => ({
  salaryDissentDetail,
  salaryHistoryDetail,
  modalModel,
  loading: loading.models.salaryDissentDetail,
}))
@Form.create()
export default class SalaryDissentDetail extends PureComponent {
  state = {
    currentItem: {}, //当前编辑的异议记录
  }
  //取出从url传来的数据
  salaryId = this.props.match.params.salaryId;  //对应的工资记录的id

  componentWillMount() {
    flowRecord();
    //获取异议内容
    this.props.dispatch({
      type: 'salaryDissentDetail/get',
      payload: {
        salaryId: this.salaryId,
      }
    }).then(() => {
      const {salaryDissentList: list} = this.props.salaryDissentDetail.data;
      list && list.length > 0 && this.setState({currentItem: list[list.length - 1]});  //设置回复框默认回复的记录为最新(当前)的异议，后端需要按异议创建时间升序排序
    });
    //请求工资条数据
    this.props.dispatch({
      type: 'salaryHistoryDetail/salaryPayroll',
      payload: {
        salaryDetailId: this.salaryId
      }
    })
  }

  //处理modal的取消操作
  handleCancel = () => {
    this.props.dispatch({
      type: 'modalModel/hideModal',
    });
  }

  handleRefresh = () => {
    //获取异议回复
    this.props.dispatch({
      type: 'salaryDissentDetail/get',
      payload: {
        salaryId: this.salaryId,
      }
    });
  }

  //提交回复内容
  submitReply = (values) => {
    //调用dispatch，执行effect提交回复的信息
    this.props.dispatch({
      type: 'salaryDissentDetail/save',
      payload: {
        id: this.state.currentItem.id,
        salaryId: this.salaryId,
        replyContent: values.replyContent
      },
    }).then(() => {
      this.handleRefresh();
    });
  }

  /**
   * 点击修改内容时调用的function
   */
  handleEditReply = (currentItem) => {
    this.setState({currentItem: currentItem});
    this.props.dispatch({
      type: 'modalModel/showModal',
      payload: {}
    })
  }

  handleReplyForm = (e) => {
    e.preventDefault();
    const {dispatch, form} = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      //取出表中字段
      const values = {
        ...fieldsValue
      };
      // 向服务器发送数据
      dispatch({
        type: "salaryDissentDetail/save",
        payload: {
          id: this.state.currentItem.id,
          salaryId: this.salaryId,
          replyContent: values.replyContent,
        },
      }).then(() => {
        form.resetFields();  //重置表单内容
        this.handleRefresh();
      })
    });

  }

  //渲染页面
  render() {
    const {emp, salaryDissentList} = this.props.salaryDissentDetail.data;
    const {modalModel: {modalVisible, modalTitle}, salaryHistoryDetail: {salaryPayrollData = {}}} = this.props;
    const {fields, salaryPayroll} = salaryPayrollData;

    const modalParams = {
      modalVisible,
      modalTitle,
      handleCancel: this.handleCancel,
      submitReply: this.submitReply,
      currentItem: this.state.currentItem
    }

    return (
      <div style={{maxWidth: '85%'}}>
        {/*工资条*/}
        <Card bordered={true}>
          <DescriptionList size="large" title="基本资料" style={{marginBottom: 32}}>
            {
              fields && fields.map((field) => {
                return <Description key={field.id} term={field.fieldName}>{salaryPayroll[field.fieldName]}</Description>
              })
            }
          </DescriptionList>
        </Card>
        {/*聊天框*/}
        <Card bordered={true} style={{marginTop:'15px'}}>
          <Row>
            <div>
              <DescriptionList size="large" title="沟通记录" style={{marginBottom: 32}}>
                {
                  salaryDissentList && salaryDissentList.map(item =>
                      <div key={item.id}>
                        {/* 用户发出的异议信息*/}
                        {item.content && <Row type="flex" justify="space-between" style={{marginBottom: '10px'}}>
                          <Col style={{'color': 'black'}}>{item.content}</Col>
                          <Col><span className={salaryStyle.replyName}>{emp.name} </span>{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
                        </Row>}
                        {/*管理员回复的信息*/}
                        {item.replyUser ? <div>
                          <Row type="flex" justify="space-between" style={{marginBottom: '10px'}}>
                            <Col style={{'color': 'red'}}>回复：{item.replyContent}</Col>
                            <Col><span className={salaryStyle.replyName}>{item.replyUser.realName} </span>{moment(item.replyTime).format('YYYY-MM-DD HH:mm:ss')}</Col>
                          </Row>
                          <Row type="flex" justify="end">
                            <Button type="primary" size="small" onClick={() => {this.handleEditReply(item)}}>修改回复</Button>
                          </Row>
                        </div> : <Row type="flex" justify="end">
                          <Button type="primary" size="small" onClick={() => {this.handleEditReply(item)}}>回复</Button>
                        </Row>}
                        <Divider/>
                      </div>
                  )
                }
              </DescriptionList>
            </div>
          </Row>
          {/*渲染modal*/}
          <CreateForm
            {...modalParams}
          />
        </Card>
      </div>
    )
  }
}
