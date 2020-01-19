import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import { Steps, Form, Button, Modal, Tooltip, Icon} from 'antd';
import authStyle from './AuthShow.less';
import {cons} from '../../common/constant';
import formStyles from '../../assets/less/Form.less';
import flowRecord from './../../utils/flowRecord'

const Step = Steps.Step;
/**
 * modal 弹出窗口组件
 * @type {React.ComponentClass<RcBaseFormProps&Omit<P, keyof FormComponentProps>>}
 */
const CreateForm = Form.create()((props) => {
  const { modalVisible, modalTitle, modalContent, modalFooter, handleCancel } = props;
  return   <Modal
    title={modalTitle}
    visible={modalVisible}
    onCancel={handleCancel}
    onOk={handleCancel}
    footer={<Button type="primary" onClick={handleCancel}>{modalFooter}</Button>}
  >
    {modalContent}
  </Modal>
});

/**
 * 与对应model关联
 */
@connect(({auth, loading}) => ({
  auth,
  loading: loading.models.auth,
}))
@Form.create()
export default class AuthShow extends PureComponent {
  state = {
    modal: {
      modalVisible:false,
      modalTitle: '',
      modalContent: '',
      modalFooter: ''
    }
  };
  componentWillMount() {
    flowRecord();
  }

  /**
   *  处理下载合同模版的操作
  */
  downloadContractTemplate = () => {
    this.props.dispatch({
      type:"auth/download"
    });
    window.location.href = cons.url.base_url+"/download/xd.docx";
  }

  /**
   *  显示注意事项modal
   */
  showAttentionModal=()=>{
    const modalTitle = "签署注意事项";
    const modalContent = (
      <div>
        <p>1. 签署合同时，请务必确认合同内容。</p>
        <p>2. 合同需要在尾页加盖公章，并且加盖骑缝章。</p>
        <p>3. 薪动代发工资服务由京东金融提供服务支持，故合同签署主体为京东金融。</p>
      </div>
    );
    const modalFooter = "我已了解";
    this.setState({
      modal: {
        modalVisible: true,
        modalTitle,
        modalContent,
        modalFooter
      }
    });
  }

  /**
   * 显示address modal
   */
  showAddressModal=()=>{
    const modalTitle = "签收地址";
    const modalContent = (
      <div>
        <p>收件人：吴鑫琳</p>
        <p>联系方式：18610485000</p>
        <p>部门：京东金融 金融科技业务部 非银机构合作部</p>
        <p>地址：北京市亦庄经济开发区科创十一街18号院A座17层</p>
        <p>邮编：101111</p>
      </div>
    );
    const modalFooter = "关闭";
    this.setState({
      modal: {
        modalVisible: true,
        modalTitle,
        modalContent,
        modalFooter
      }
    })
  }

  //处理modal的取消操作
  handleCancel = () => {
    this.setState({
      modal: {
        modalVisible:false,
        modalTitle: '',
        modalContent: '',
        modalFooter: ''
      }
    })
  }

  /**
   * 重新获取用户信息，如菜单，认证状态等
   */
  updateUserInfo = () => {
    this.props.dispatch({
      type:"auth/updateUserInfo"
    });
  }

  /**
   * 渲染页面
   */
  render() {
    const {modal: {modalVisible,modalTitle,modalContent,modalFooter}} = this.state;
    const modalParams={
      modalVisible,
      modalTitle,
      modalContent,
      handleCancel:this.handleCancel,
      modalFooter,
    }

    return (
      <div>
        <div>
          <div className={authStyle.stepsTitle}>为保障您的权益，在开始使用前，请先完成商务认证程序
              <span style={{marginLeft:"3px"}}>
                <Tooltip title="已经认证？点击这里">
                  <Icon className={formStyles.infoIcon} onClick={this.updateUserInfo} type="info-circle-o"/>
              </Tooltip>
              </span>
          </div>
          <div className={authStyle.steps}>
            <Steps>
              <Step key='0' title='签署合同' description={<a>点击下载合同模版</a>} onClick={this.downloadContractTemplate}/>
              <Step key='1' title='邮寄合同' description={<a>点击查看签署注意事项</a>} onClick={this.showAttentionModal}/>
              <Step key='2' title='商务认证' description={<a>点击查看签收地址</a>} onClick={this.showAddressModal}/>
              <Step key='3' title='商务认证完成' />
            </Steps>
          </div>
        </div>
       {/*渲染Modal*/}
       <CreateForm {...modalParams} />
      </div>
    );
  }
}
