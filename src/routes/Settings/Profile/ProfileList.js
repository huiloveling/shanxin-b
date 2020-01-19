import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import { Card, Row, Col, Form, Input, Button, Modal, message} from 'antd';
import styles from '../../Account/Register.less';
import DescriptionList from '../../../components/DescriptionList';
import {cons} from '../../../common/constant';
import {userInfoUtil} from '../../../utils/UserInfoUtil';
import flowRecord from './../../../utils/flowRecord'

const FormItem = Form.Item;
const { Description } = DescriptionList;

const CreateForm = Form.create()((props) => {
  const {modalVisible,handleCancel,modalTitle, modalContent,modalFooterText, handleOk, renderTemplateInfo, imageCodeUrl, refreshImageCode, onGetCaptcha,count,form} = props;

  const onOk = () =>{
    handleOk(form);
  }

  const onCancel = () => {
    handleCancel();
    form.resetFields();
  }

  const checkCaptcha = () => {
    const values = {
      phone:form.getFieldValue('phone'),
      imageCode:form.getFieldValue('imageCode'),
    };
    onGetCaptcha(values);
  }

  /**
   * 渲染表单
   * @returns {JSX}
   */
  const renderReplyForm = () => {
    const {getFieldDecorator} = form;
    return (
      <div>
        <FormItem key="1" label="" className={styles.formItem}>
          <Row gutter={8}>
            <Col span={16}>
          {getFieldDecorator('phone', {
            rules: [
              {
                required: true,
                message: '请输入手机号！',
              },
              {
                pattern: /^1\d{10}$/,
                message: '手机号格式错误！',
              },
            ],
          })(
            <Input
              size="large"
              // style={{ width: '75%' }}
              placeholder="请输入新手机号"
            />
          )}
            </Col>
          </Row>
        </FormItem>
        <FormItem className={styles.formItem}>
          <Row gutter={8}>
            <Col span={16}>
              {getFieldDecorator('imageCode', {
                rules: [
                  {
                    required: true,
                    message: '请输入图片验证码！',
                  },
                ],
              })(<Input size="large" placeholder="图片验证码" />)}
            </Col>
            <Col span={8}>
              <img src={imageCodeUrl} onClick={refreshImageCode} className={styles.imageCodeItem}/>
            </Col>
          </Row>
        </FormItem>
        <FormItem className={styles.formItem}>
          <Row gutter={8}>
            <Col span={16}>
              {getFieldDecorator('smsCode', {
                rules: [
                  {
                    required: true,
                    message: '请输入验证码！',
                  },
                ],
              })(<Input size="large" placeholder="验证码" />)}
            </Col>
            <Col span={8}>
              <Button
                size="large"
                disabled={count}  /*这里之后改成，如果用户未输入正确的图片验证码，就禁用，否则启用*/
                className={styles.getCaptcha}
                onClick={checkCaptcha}
                // hidden={true}
              >
                {count ? `${count} s` : '获取验证码'}
              </Button>
            </Col>
          </Row>
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
      {renderReplyForm()}
    </Modal>
  )
});

@connect(({profile,formModel,modalModel,register,loading}) => ({
  formModel,
  modalModel,
  profile,
  register,
  loading: loading.models.profile,
}))
@Form.create()
export default class ProfileList extends PureComponent {
  state={
    changingContact:false,
    count: 0,
    imageCodeUrl: cons.url.base_url + '/common/captcha/image',
  }
  componentWillMount() {
    flowRecord();
  }
  /**
   * 显示修改手机号的modal
   */
  handleUpdatePhone= () => {
    this.props.dispatch({
      type:'modalModel/showModal',
      payload:{
        modalTitle: "修改手机号",
        modalContent: "",
        modalFooterText:'确定',}
    })
  }

  onGetCaptcha = (values) => {
    const phone = values.phone;
    const imageCode = values.imageCode;
    this.props.dispatch({
      type: 'register/sendSms',
      payload: { phone, imageCode },
    }).then((response)=>{
      if (response.code === 0) {
        let count = 59;
        this.setState({ count });
        this.interval = setInterval(() => {
          count -= 1;
          this.setState({ count });
          if (count === 0) {
            clearInterval(this.interval);
          }
        }, 1000);
        message.success("短信验证码发送成功！");
      }else{
        message.error(response.msg);
      }
    });
  };

  refreshImageCode = () => {
    this.setState({imageCodeUrl: cons.url.base_url + '/common/captcha/image?r='+ new Date().getTime()}) // TODO  试一下这里是不是随便加个数字就可以。。
  }

  /**
     处理modal的取消操作
   */
  handleCancel = () => {
    this.props.dispatch({
      type: 'modalModel/hideModal',
    });
  }

  /**
   * 提交内容
   * @param values
   */
  handleOk = (form) => {
    console.log("form",form)
    form.validateFields((err, fieldsValue)=>{
      if(err) return;
      this.props.dispatch({
        type: 'register/checkSms',
        payload: {
          ...fieldsValue,
          code:fieldsValue.smsCode,
          prefix: this.state.prefix,
        },
      }).then(()=>{
        const { smsCodeCheckState } = this.props.register;
        //如果短信验证码正确，则提交注册信息
        if(smsCodeCheckState) {
          this.handleCancel();
          form.resetFields(); //重置表单，避免第二次弹出modal时依然有当前的内容
          //执行更新手机号的操作
          this.props.dispatch({
            type: 'profile/updatePhone',
            payload: {
              id:userInfoUtil.getCurrentUser().id,
              phone:fieldsValue.phone,
              smsCode:fieldsValue.smsCode,
            },
          })
        }else{
          message.error("短信验证码有误！")
        }
      }) ;
    })
  }

  handleRefresh = () => {
    const {dispatch} = this.props;
    dispatch({
      type: 'profile/list',
      payload:{}
    });
  }

  /**
   * 执行异步操作更新用户名
   */
  updateUserName = (e) => {
    const newContact = e.target.value;
    if (newContact == null || newContact.replace(/^\s\s*/, '').replace(/\s\s*$/, '') === '') {
      this.switchChangingContact();
    } else {
      console.log("newContact", newContact);
      this.props.dispatch({
        type: 'profile/updateContact',  //type的值如果用双引号包起来，dispatch会失效，action不会被执行，靠
        payload: {
          userId: userInfoUtil.getCurrentUser().id,
          contact: newContact
        }
      }).then(() => {
        this.setState({changingContact: false});
        this.handleRefresh()
      })
    }
  }

  switchChangingContact = () => {
    this.setState({changingContact:!this.state.changingContact}, () => {
      if (this.state.changingContact) {
        this.refs.realName.focus();
      }
    });
  }

  /**
   * 渲染页面
   * @returns {XML}
   */
  render() {
    const user =  userInfoUtil.getCurrentUser();
    console.log("user", user);
    const {modalModel: {modalVisible,modalTitle,modalContent,modalFooterText}, loading} = this.props;
    const modalParams={
      modalVisible,
      modalTitle,
      modalContent,
      handleCancel:this.handleCancel,
      modalFooterText,
      handleOk:this.handleOk,
      renderTemplateInfo:this.renderTemplateInfo,
      onGetCaptcha:this.onGetCaptcha,
      count:this.state.count,
      imageCodeUrl:this.state.imageCodeUrl,
      refreshImageCode:this.refreshImageCode,
    }

    return (
      <div>
        <Card bordered={false}>
          {/*个人资料*/}
          <div>
            <DescriptionList size="large" title="基本资料" style={{ marginBottom: 32 }}>
              <Description term="企业全称">{user.bizCustomer.companyName}</Description>
              <Description term="姓名">
                {this.state.changingContact
                  ?<Input ref="realName" style={{maxWidth:"90px",maxHeight:"30px"}} type="text" placeholder="请输入" onPressEnter={this.updateUserName} onBlur={this.updateUserName}/>
                  : <span>{user.realName} </span>}&nbsp;&nbsp;<a style={{fontSize:"10px"}} onClick={this.switchChangingContact}>{this.state.changingContact?"取消":"修改"}</a></Description>
              <Description term="关联手机号">{user.phone} <a style={{fontSize:"10px"}} onClick={this.handleUpdatePhone}>修改</a></Description>
            </DescriptionList>
            {/*用两个DescriptionList是为了避免修改联系人名字时影响原来的布局，修改input的样式应该也可以解决，不过目前没查到怎么改，就用现在的方法解决了*/}
            <DescriptionList size="large" style={{ marginTop: 32 }}>
              <Description term="商务认证日期">{moment(user.bizCustomer.checkTime).format('YYYY-MM-DD')}</Description>
            </DescriptionList>
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
