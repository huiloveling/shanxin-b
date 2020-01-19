import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import classNames from 'classnames';
import { message, Form, Input, Button, Row, Col, Popover, Progress,Icon } from 'antd';
import styles from './Register.less';
import {cons} from '../../common/constant';
import logo from '../../../public/img/logo.png'
import flowRecord from './../../utils/flowRecord'

const FormItem = Form.Item;
const InputGroup = Input.Group;
const inputClass = classNames(styles.input_box,styles.input_text);
const btnSubmit = classNames(styles.btn,styles.btn_submit);
const btnSend = classNames(styles.btn_send);

const passwordStatusMap = {
  ok: <div className={styles.success}>强度：强</div>,
  pass: <div className={styles.warning}>强度：中</div>,
  poor: <div className={styles.error}>强度：太短</div>,
};
const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};

@connect(({ forgetPassword, register, loading }) => ({
  forgetPassword,
  register,
  submitting: loading.effects['forgetPassword/submit'],
}))
@Form.create()
export default class Register extends Component {
  state = {
    count: 0,
    confirmDirty: false,
    visible: false,
    help: '',
    prefix: '86',
    phoneStatusVisible:false,  //验证手机号的icon是否显示，为true显示，否则不显示
    usernameStatusVisible:false,  //用户名是否可用的提示
    imageCodeUrl: cons.url.base_url + '/common/captcha/image',
  };
  componentWillMount() {
    flowRecord();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onGetCaptcha = () => {

    const { form } = this.props;
    const phone = form.getFieldValue('phone');
    const imageCode = form.getFieldValue('imageCode');
    if(phone==undefined){
        message.error("请先输入手机号");
        return;
    }
    if(imageCode==undefined){
        message.error("请先输入图片验证码");
        return;
    }
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

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'register/checkSms',
          payload: {
            ...values,
            code:values.smsCode,
            prefix: this.state.prefix,
          },
        }).then(()=>{
          const { smsCodeCheckState } = this.props.register;
          //如果短信验证码正确，则提交注册信息
          if(smsCodeCheckState) {
            this.props.dispatch({
              type: 'forgetPassword/submit',
              payload: {
                ...values,
                prefix: this.state.prefix,
              },
            });
          }else{
            message.error("短信验证码有误！")
          }
        }) ;
      }
    });
  };

  handleConfirmBlur = (e) => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不匹配!');
    } else {
      callback();
    }
  };

  checkPassword = (rule, value, callback) => {
    if (!value) {
      this.setState({
        help: '请输入密码！',
        visible: !!value,
      });
      callback('error');
    } else {
      this.setState({
        help: '',
      });
      if (!this.state.visible) {
        this.setState({
          visible: !!value,
        });
      }
      if (value.length < 6) {
        callback('error');
      } else {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
  };

  checkPhone = (rule, value, callback) => {
    if (!value) {
      callback('请输入手机号');
      this.setState({phoneStatusVisible:false})
    } else {
      //dispatch 检测手机号是否占用，将结果put到state
      //取出检测结果，如果验证成功则显示成功标记，否则显示错误标记
      this.props.dispatch({
        type: 'register/checkPhone',
        payload: {
          phone: value
        }
      })
      this.setState({phoneStatusVisible:true})
      callback();
    }
  }

  checkUsername = (rule, value, callback) => {
    if (!value) {
      callback('请输入用户名');
      this.setState({usernameStatusVisible:false})
    } else {
      //dispatch 检测手机号是否占用，将结果put到state
      //取出检测结果，如果验证成功则显示成功标记，否则显示错误标记
      this.props.dispatch({
        type: 'register/checkUsername',
        payload: {
          username: value
        }
      })
      this.setState({usernameStatusVisible:true})
      callback();
    }
  }

  changePrefix = (value) => {
    this.setState({
      prefix: value,
    });
  };

  refreshImageCode = () => {
    this.setState({imageCodeUrl: cons.url.base_url + '/common/captcha/image?r='+ new Date().getTime()})
  }

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ? (
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  render() {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;
    const { count, prefix, imageCodeUrl } = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.herder}>
          <Link className={styles.logo} to="/">
            <img src={logo}/>
          </Link>
          <span>人力资源与金融的链接者</span>
        </div>
        <div className={styles.content}>
          <div className={styles.center}>
            <div className={styles.title}>忘记密码</div>
              <Form onSubmit={this.handleSubmit}>
                <FormItem>
                  <InputGroup compact>
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
                        className={styles.inputClass}
                        placeholder="请输入手机号"
                      />
                    )}
                    <span style={{ width: '5%',marginTop:'10px'}} hidden={!this.state.phoneStatusVisible}>{<Icon className={this.props.register.phoneStatus?styles.success:styles.error} type={this.props.register.phoneStatus?"check-circle" :"close-circle"} />}</span>
                  </InputGroup>
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
                      })(<Input size="large" placeholder="图片验证码" className={styles.phone_code} />)}
                    </Col>
                    <Col span={8}>
                      <img src={imageCodeUrl} onClick={this.refreshImageCode} className={styles.imageCodeItem}/>
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
                      })(<Input size="large" placeholder="短信验证码" className={styles.phone_code}/>)}
                    </Col>
                    <Col span={8}>
                      <Button
                        size="large"
                        disabled={count}
                        className={btnSend}
                        onClick={this.onGetCaptcha}
                        // hidden={true}
                      >
                        {count ? `${count} s` : '获取验证码'}
                      </Button>
                    </Col>
                  </Row>
                </FormItem>
                <FormItem help={this.state.help}>
                  <Popover
                    content={
                      <div style={{ padding: '4px 0' }}>
                        {passwordStatusMap[this.getPasswordStatus()]}
                        {this.renderPasswordProgress()}
                        <div style={{ marginTop: 10 }}>
                          请至少输入 6 个字符。请不要使用容易被猜到的密码。
                        </div>
                      </div>
                    }
                    overlayStyle={{ width: 240 }}
                    placement="right"
                    visible={this.state.visible}
                  >
                    {getFieldDecorator('password', {
                      rules: [
                        {
                          required: true,
                          message: '请输入密码！',
                        },
                        {
                          validator: this.checkPassword,
                        },
                      ],
                    })(
                      <Input
                        className={styles.inputClass}
                        size="large"
                        type="password"
                        placeholder="至少6位，区分大小写"
                      />
                    )}
                  </Popover>
                </FormItem>
                <FormItem>
                  {getFieldDecorator('confirm', {
                    rules: [
                      {
                        required: true,
                        message: '请确认密码！',
                      },
                      {
                        validator: this.checkConfirm,
                      },
                    ],
                  })(<Input size="large" type="password" placeholder="确认密码" className={styles.inputClass}/>)}
                </FormItem>
                <FormItem style={{marginBottom:'0'}}>
                  <Button
                    size="large"
                    loading={submitting}
                    className={btnSubmit}
                    style={{marginTop:'4px'}}
                    type="primary"
                    htmlType="submit"
                  >
                    提交
                  </Button>
                </FormItem>
                <div className={styles.login}>
                    <Link to="/account/login">
                      使用已有账户登录
                    </Link>
                </div>
              </Form>
            </div>
          </div>
          <div className={styles.footer}>
            <div className={styles.inner_content}>
                <p>薪动（青岛）网络科技有限公司</p>
                <p>鲁ICP备19007302号</p>
            </div>
          </div>
        </div>
    );
  }
}
