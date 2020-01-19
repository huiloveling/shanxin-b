import React, {Component} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import classNames from 'classnames';
import {Button, Checkbox, Col, Form, Input, message, Popover, Progress, Row, Modal} from 'antd';
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

@connect(({ register, loading }) => ({
  register,
  submitting: loading.effects['register/submit'],
}))
@Form.create()
export default class Register extends Component {
  phoneRegex = "^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$";
  state = {
    count: 0,
    confirmDirty: false,
    visible: false,
    agreementModal:false,
    help: '',
    prefix: '86',
    phoneStatusVisible:false,  //验证手机号的icon是否显示，为true显示，否则不显示
    usernameStatusVisible:false,  //用户名是否可用的提示
    isReadProtocol:true,
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
    console.log(phone);
    console.log(imageCode);
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
  refreshImageCode =  ()=>{
    var time = new Date().getTime();
    this.setState({ imageCodeUrl: cons.url.base_url + '/common/captcha/image?r=' + time });
  }
  handleSubmit = (e) => {
      e.preventDefault();
      if(this.state.isReadProtocol==true){
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
                    type: 'register/submit',
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
      }else{
          message.error("请勾选协议");
      }

  };
  changeIsRead = (e) =>{
    this.setState({
      isReadProtocol: e.target.checked,
    });
  };
  handleConfirmBlur = (e) => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
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
  hideAgreementModal = ()=>{
    this.setState({
      agreementModal:false
    })
}
  checkPhone = (rule, value, callback) => {
    if (!value) {
      callback('');
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
  agreementModel=()=>{
    return ( <Modal
                title="服务协议"
                width={"800px"}
                visible={this.state.agreementModal}
                onOk={this.hideAgreementModal}
                onCancel={this.hideAgreementModal}
                bodyStyle={{height:'500px',overflowY:'scroll'}}
    >
                  <p>
                    <span><span >特别提醒：您注册本站、使用薪动（青岛）网络科技有限公司（以下简称“薪动科技”）提供的服务即视为您对本协议全部条款及网站运营规则已充分理解并完全接受，网站运营规则视为本协议不可分割的组成部分。请您务必仔细阅读、充分理解本协议各条款及网站规则。</span></span>
                  </p>
                  <p>
                    <span className={styles.protocol_title}>1. 主体</span>
                  </p>
                  <p>
                    <span>1.1 薪动（青岛）网络科技有限公司（以下简称“薪动科技”）依据本协议为您（以下简称“用户”）提供管理工具、代发工资、税务筹划、业务咨询等服务。</span><br/>
                    <span>1.2 用户即发薪主体（以下称“您”或“用户”）是指符合中华人民共和国法律，具有完全民事权利及民事行为能力，能够独立承担民事责任的法人团体或机构。</span><br/>
                    <span>1.3 员工是指符合中华人民共和国法律，具有完全民事权利及民事行为能力的自然人，与发薪主体存在劳动关系，或事实上的雇佣关系。</span>
                  </p>
                  <p>
                    <span className={styles.protocol_title}>2. 权利与义务</span>
                  </p>
                  <p>
                    <span>2.1 用户根据薪动科技合作金融机构要求向其提供营业执照、开户许可证等书面资料，并在合作金融机构开立发薪专用银行账号。</span><br/>
                    <span>2.2 用户、员工有义务根据协议向我方及为我方提供技术支持的第三方提供必要的真实、有效及完整的用户信息。</span><br/>
                    <span>2.3 用户协助员工在用户指定或认可的移动端（包括但不限于微信服务号、APP等）及时注册并认证个人信息，确保个人信息准确无误。</span><br/>
                    <span>2.4 为更好的提供服务，在本协议有效期及延续期，您同意并授权薪动科技查询发薪账户余额、留存用户向合作银行提交的代发工资相关指令，合作银行向用户返回的代发结果等信息。</span><br/>
                    <span>2.5 用户保证发薪账号资金充足，如因您在发薪账户内可用资金不足或因收付账号状态不正常（如冻结、挂失或其它情况等）等原因导致无法按时入账等问题造成延误发放的，由用户负责。</span><br/>
                    <span>2.6 用户承诺，其通过薪动科技网站上传或发布的信息均真实有效，其向薪动科技及其合作机构提交的任何资料均真实、有效、完整、详细、准确。如因违背上述承诺，造成薪动科技或其合作机构、其他使用方损失的，用户将承担相应责任。</span><br/>
                    <span>2.7 用户同意薪动科技有权在法律法规、政府监管部门和/或为实现代发工资服务、融资咨询服务及其它业务所必须的要求的情况下将其相关信息提供给合作机构、政府监管部门进行核查，具体需要核查的信息以合作机构、政府监管部门的要求为准。</span><br/>
                    <span>2.8 用户同意薪动科技有权根据合作机构、相关监管部门及司法机关的要求或风险控制的需要，而终止、中止代发工资服务。</span><br/>
                    <span>2.9 未经同意用户不得使用薪动科技名称、标识、链接以及业务资料进行宣传，用户擅自使用薪动科技名称、标识、链接以及业务资料进行宣传的，我方有权追究其法律责任。</span><br/>
                    <span>2.10 用户确认并认可薪动科技及其合作机构利用用户及员工信息进行业务分析活动。</span><br/>
                    <span>2.11 用户及员工确认并认可薪动科技采用电子邮件、手机短信、微信服务号等渠道向您及您的员工发送有关通知、业务信息。</span>
                  </p>
                  <p>
                    <span className={styles.protocol_title}>3. 服务内容及权利义务</span>
                  </p>
                  <p>
                    <span>3.1 薪动科技向用户提供:薪酬管理、工资代发、管理工具、流程优化、薪税筹划、业务咨询等服务。</span><br/>
                    <span>3.2 薪动科技有权根据业务需要对服务协议内容进行修改。如服务协议内容发生变动，通过网站等渠道公布最新的服务协议，不再向用户作个别通知。如用户对对服务协议所做的修改存有异议，有权停止使用服务。用户停止使用服务的，不免除之前使用服务产生的权利与义务。如用户继续使用服务，则视为用户接受对服务协议的修改。</span><br/>
                    <span>3.3 薪动科技网站业务规则、公告、电子邮件、短信息等方式发布的有关业务规则调整内容、通知等视为本服务协议的一部分。</span><br/>
                    <span>3.4 薪动科技发薪水服务需要收薪员工在指定移动端（APP或者微信公众号）进行身份认证，如用户发薪过程中出现员工因未能在移动端进行身份认证无法收到工资，由此造成的损失由用户承担，薪动科技不承担任何责任。</span><br/>
                    <span>3.5 薪动科技有权根据风险防范，对疑似欺诈、套现、洗钱、非法融资、恐怖融资等交易，及时采取调查核实、随时中止（终止）向用户提供代发工资服务等措施。</span><br/>
                    <span>3.6 为提升用户体验，用户须向合作机构提交基本户开户银行账号信息、发薪日期、发薪人数等有关信息。</span><br/>
                    <span>3.7 交易异常处理:您使用本服务时，可能由于银行本身系统问题、银行相关作业网络连线问题或其他不可抗拒因素，造成本服务无法继续进行，薪动科技不承担任何损害赔偿责任。您确保所输入的信息无误，如果因信息错误造成于上述异常状况发生之时，无法及时通知您相关交易后续处理方式的，薪动科技不承担任何损害赔偿责任。</span><br/>
                    <span>3.8 交易监控:薪动科技将对所有交易活动实施实时监控。如用户的活动存在违反有关法律法规的可能，薪动科技可以暂时停止、限制全部或部分服务，并不承担由此造成的损失。</span>
                  </p>
                  <p >
                    <span className={styles.protocol_title}>4. 除外责任</span>
                  </p>
                  <p>
                    <span>4.1 在任何情况下，对于您使用薪动科技服务过程中涉及由第三方提供相关服务的责任由该第三方承担，薪动科技不承担该等责任。薪动科技不承担责任的情形包括但不限于:</span><br/>
                    <span>（1）因银行、第三方支付机构等第三方未按照您及（或）薪动科技指令进行操作引起的任何损失或责任；</span><br/>
                    <span>（2）因银行、第三方支付机构等第三方原因导致资金未能及时到账或未能到账引起的任何损失或责任；</span><br/>
                    <span>（3）因银行、第三方支付机构等第三方对交易限额或次数等方面的限制而引起的任何损失或责任；</span><br/>
                    <span>（4）因其他第三方的行为或原因导致的任何损失或责任。</span><br/>
                    <span>4.2 薪动科技有权基于交易安全等方面的考虑不时设定涉及交易的相关事项，包括但不限于交易限额、交易次数等，用户了解前述设定可能会对交易造成一定不便，对此没有异议。</span>
                  </p>
                  <p>
                    <span className={styles.protocol_title}>5. 服务费用</span>
                  </p>
                  <p>
                      <span>5.1 薪动科技代发工资服务向客户免费提供，但薪动科技保留调整收费标准的权利。薪动科技调整收费标准后用户继续使用薪动科技服务的，视为同意薪动科技收费标准的调整。</span><br/>
                      <span>5.2 用户在使用薪动科技服务过程中（如充值或取现等）可能需要向第三方（如银行或技术支持机构）提交用户信息、签订有关业务合同，如用户使用薪动科技提供的服务即表示同意并认可使用第三方服务须提交用户信息及签订有关合同的安排。</span>
                  </p>
                  <p>
                    <span className={styles.protocol_title}>6. 账户安全及管理 </span>
                  </p>
                  <p>
                      <span>6.1 用户了解并同意，确保薪动科技账户及密码的机密安全是用户的责任。用户将对利用该薪动科技账户及密码所进行的一切行动及言论，负完全的责任。</span><br/>
                      <span>6.2 用户同意，薪动科技账户的暂停、中断或终止不代表用户责任的终止，用户仍应对使用薪动科技服务期间的行为承担可能的违约或损害赔偿责任，同时薪动科技仍可保有用户的相关信息。</span>
                  </p>
                  <p>
                    <span className={styles.protocol_title} className={styles.protocol_title}>7. 用户的守法义务及承诺</span>
                  </p>
                  <p>
                      <span>7.1 用户承诺绝不为任何非法目的或以任何非法方式使用薪动科技服务，并承诺遵守中国相关法律、法规及一切使用互联网之国际惯例，遵守所有与薪动科技服务有关的网络协议、规则和程序。</span><br/>
                      <span>7.2 用户同意并保证不得利用薪动科技服务从事侵害他人权益或违法之行为，若有违反者应负所有法律责任。</span><br/>
                      <span>7.3用户保证其使用代发工资服务仅用于合法的业务经营活动，工资支付行为真实有效，合法合规，不会违反法律法规规定，也不会侵犯任何第三人的利益。用户或用人单位应根据《中华人民共和国个人所得税法》的相关规定履行个人所得税的代扣代缴义务。您不得利用薪动科技提供的服务的便利性进行偷税漏税等非法行为。因此造成薪动科技损失的，薪动科技有权向您方追偿所有损失，并有权提前终止或中止双方已签署的全部或部分协议。</span><br/>
                      <span>7.4用户不得利用或与第三方串通利用代发工资服务从事洗钱、赌博、套现、诈骗、恐怖融资等违法、违规活动，如用户涉嫌上述违法、违规、犯罪活动的，薪动科技有权立即停止服务，并有权向有关监管机关或司法机关报告。用户有义务采取必要的措施防范上述风险，并配合薪动科技、第三方合作机构、有关部门的调查并提供证明文件，用户应承担因违法行为导致的法律责任。因用户的此类行为给薪动科技、合作机构造成损失的，用户有赔偿责任。</span>
                  </p>
                  <p>
                    <span className={styles.protocol_title}>8. 风险提示</span>
                  </p>
                  <p>
                      <span>8.1 用户同意，由于黑客攻击、网络供应商技术调整或故障、网站升级、银行方面的问题等原因而造成薪动科技服务中断或延迟的，薪动科技不承担责任。</span><br/>
                      <span>8.2因台风、地震、海啸、洪水、停电、战争、恐怖袭击等不可抗力之因素，造成薪动科技系统障碍不能执行业务的，薪动科技不承担责任。</span>
                  </p>
                  <p>
                    <span className={styles.protocol_title}>9. 隐私权保护及授权条款</span>
                  </p>
                  <p>
                      <span>9.1 薪动科技对于用户提供的、经认证的个人信息将按照本协议予以保护、使用或者披露。</span><br/>
                      <span>9.2 薪动科技按照用户在薪动科技网站上的行为自动追踪关于用户的某些资料。在不透露用户的隐私资料的前提下，薪动科技有权对整个用户数据库进行分析并对用户数据库进行商业上的利用。</span><br/>
                      <span>9.3 用户同意，薪动科技可在薪动科技网站的某些网页上使用诸如“Cookies”的资料收集装置。</span><br/>
                      <span>9.4 用户同意薪动科技可使用关于用户的相关资料（包括但不限于薪动科技持有的有关用户的档案中的资料，薪动科技从用户目前及以前在薪动科技网站上的活动所获取的其他资料以及薪动科技通过其他方式自行收集的资料）以解决争议、对纠纷进行调停。用户同意薪动科技可通过人工或自动程序对用户的资料进行评价。</span><br/>
                      <span>9.5 薪动科技采用行业标准惯例以保护用户的资料。用户因履行本协议提供给薪动科技的信息，薪动科技不会恶意出售或免费共享给任何第三方，以下情况除外:</span><br/>
                      <span>（1）提供独立服务且仅要求服务相关的必要信息的供应商，如印刷厂、邮递公司等；</span><br/>
                      <span>（2）具有合法调阅信息权限并从合法渠道调阅信息的政府部门或其他机构，如公安机关、法院；</span><br/>
                      <span>（3）薪动科技的关联实体；</span><br/>
                      <span>（4）经平台使用方或平台使用方授权代表同意的第三方。</span><br/>
                      <span>9.6 薪动科技有义务根据有关法律要求向司法机关和政府部门提供您的个人资料。</span>
                  </p>
                  <p>
                    <span className={styles.protocol_title}>10. 知识产权的保护</span>
                  </p>
                  <p>
                      <span>10.1 非经薪动科技或其他权利人书面同意，任何人不得擅自使用、修改、复制、公开传播、改变、散布、发行或公开发表薪动科技网站程序或内容。</span>
                  </p>
                  <p>
                    <span className={styles.protocol_title}>11. 法律适用及争端解决</span>
                  </p>
                  <p>
                      <span>11.1 本协议是由用户与薪动科技共同签订的，适用于用户在薪动科技的全部活动。本协议内容包括但不限于协议正文条款及已经发布的或将来可能发布的各类规则，所有条款和规则为协议不可分割的一部分，与协议正文具有同等法律效力。</span><br/>
                      <span>11.2 本服务协议中的部分条款完全或部分无效或不具有执行力，不影响本服务协议其他条款的法律效力。</span><br/>
                      <span>11.3 本协议签订地为山东青岛。因本协议所引起的用户与薪动科技的任何纠纷或争议，首先应友好协商解决，协商不成的，用户在此完全同意将纠纷或争议提交薪动科技所在地有管辖权的人民法院诉讼解决。</span><br/>
                      <span>11.4 薪动科技对本服务协议拥有最终的解释权。</span>
                  </p>
              </Modal>)
}

  render() {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;
    const { count, prefix, imageCodeUrl} = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.herder}>
          <a className={styles.logo} href="/">
            <img src={logo}/>
          </a>
          <span>人力资源与金融的链接者</span>
        </div>
        <div className={styles.content} style={{paddingBottom:"44px"}}>
          <div className={styles.center}>
            <div className={styles.title}>注&nbsp;&nbsp;&nbsp;&nbsp;册</div>
            <Form onSubmit={this.handleSubmit}>
              <FormItem>
                {getFieldDecorator('companyName',{
                    rules: [
                      {
                        required: true,
                        message: '请输入企业全称！',
                      },
                    ],
                  })(<Input size="large" placeholder="企业全称" className={styles.inputClass} />)}
              </FormItem>
              <FormItem>
                  {getFieldDecorator('contact', {
                    rules: [
                      {
                        required: true,
                        message: '请输入联系人姓名！',
                      },
                    ],
                  })(<Input size="large" placeholder="联系人姓名" className={styles.inputClass} />)}
              </FormItem>
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
                      {validator:this.checkPhone}
                    ],
                  })(
                    <Input
                      size="large"
                      className={styles.inputClass}
                      placeholder="11位手机号"
                    />
                  )}
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
              <FormItem>
                <InputGroup compact>
                {getFieldDecorator('username',{
                  rules: [
                    {
                      validator: this.checkUsername,
                    },
                  ],
              })(<Input size="large" placeholder="用户名"  className={styles.inputClass}/>)}
                </InputGroup>
              </FormItem>
              <FormItem help={this.state.help} style={{marginBottom:0}}>
                <div id='popover'>
                  <Popover
                    getPopupContainer={() => document.getElementById('popover')}
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
                    
                    <div >
                      {getFieldDecorator('password', {
                        rules: [
                          {
                            required: true,
                            message: '请输入用户名！',
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
                          placeholder="至少6位密码，区分大小写"
                        />
                      )}
                    </div>
                  </Popover>
                </div>
              </FormItem>
              <div className={styles.options}>
                <Checkbox checked={this.state.isReadProtocol} onChange={this.changeIsRead}><span >我已阅读并同意<a style={{color:'#2b99ff'}} onClick={()=>{ this.setState({agreementModal:true})}}>《平台服务协议》</a></span></Checkbox>
              </div>
              <FormItem>
                <Button
                  size="large"
                  loading={submitting}
                  className={btnSubmit}
                  type="primary"
                  htmlType="submit"
                >
                  现在注册
                </Button>
                <div className={styles.login} style={{marginBottom:"0"}}>
                  <span>已有账号，</span> <Link to="/account/login">现在登录</Link>
                </div>
              </FormItem>
            </Form>
        </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.inner_content}>
              <p>薪动（青岛）网络科技有限公司 鲁ICP备19007302号</p>
          </div>
        </div>
        {this.state.agreementModal ? this.agreementModel():''}
      </div>
    );
  }
}
