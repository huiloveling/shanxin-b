import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Card, Form, Input, Button, Popover, Progress } from 'antd';
import styles from '../../Account/Register.less';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const FormItem = Form.Item;

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

@connect(({ updatePassword,loading }) => ({
  updatePassword,
  submitting: loading.effects['updatePassword/submit'],
}))
@Form.create()
export default class UpdatePassword extends Component {
  state = {
    count: 0,
    confirmDirty: false,
    visible: false,
    help: '',
    prefix: '86',
  };

  userid = this.props.match.params.userid;

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onGetCaptcha = () => {
    let count = 59;
    this.setState({ count });
    this.interval = setInterval(() => {
      count -= 1;
      this.setState({ count });
      if (count === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
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
          type: 'updatePassword/submit',
          payload: {
            password:values.password,
            newPassword:values.newPassword,
            bizUserId:this.userid,
          },
        });
      }
    });
  };

  handleBack = () => {
    window.history.back();
  }
  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('newPassword')) {
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
    const { form } = this.props;
    const { getFieldDecorator } = form;
    // className={styles.main}
    return (
    <PageHeaderLayout>
        <Card className={styles.main}>
        <div>
          <p></p>
          <Form onSubmit={this.handleSubmit}>
            <FormItem help={this.state.help} className={styles.formItem}>
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
                      message: '请输入旧密码！',
                    },
                    {
                      validator: this.checkPassword,
                    },
                  ],
                })(
                  <Input
                    size="large"
                    type="password"
                    placeholder="请输入旧密码"
                  />
                )}
              </Popover>
            </FormItem>
            <FormItem help={this.state.help} className={styles.formItem}>
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
                {getFieldDecorator('newPassword', {
                  rules: [
                    {
                      required: true,
                      message: '请输入新密码',
                    },
                    {
                      validator: this.checkPassword,
                    },
                  ],
                })(
                  <Input
                    size="large"
                    type="password"
                    placeholder="请输入新密码，至少6位"
                  />
                )}
              </Popover>
            </FormItem>
            <FormItem className={styles.formItem}>
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
              })(<Input size="large" type="password" placeholder="确认新密码" />)}
            </FormItem>
            <FormItem className={styles.formItem}>
              <Button
                // className={styles.submit}
                size="large"
                onClick={this.handleBack}
                style={{width:"49%"}}
              >
                返回
              </Button>
              {/*<p style={{width:"2%"}}></p>*/}
              <Button
                size="large"
                // className={styles.submit}
                type="primary"
                htmlType="submit"
                style={{width:"49%", marginLeft:"2%"}}
              >
                提交
              </Button>
            </FormItem>
          </Form>
        </div>
        </Card>
    </PageHeaderLayout>
    );
  }
}
