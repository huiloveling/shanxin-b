import {checkPhone, checkSms, checkUsername, register, sendSms} from '../../services/account/register';
import {message} from 'antd';

export default {
  namespace: 'register',

  state: {
    status: undefined,
    phoneStatus:false,  //用于指示用户输入的密码是否正确
    usernameStatus:false,
    smsCodeSendState: false,
    smsCodeCheckState: false,
  },

  effects: {
    *submit({payload}, { call, put }) {
      const response = yield call(register,payload);
      if (response.code === 0) {
        yield message.success("注册成功！即将跳转到登录页！",3,()=>{window.location.href='/account'}); //提示注册成功然后执行跳转操作
      }else{
        yield message.error(response.msg)
      }
    },

  *checkPhone({payload}, { call, put }) {
      const response = yield call(checkPhone,payload);
    //更新手机号是否可用的state
      yield put({
        type:'setStatus',
        payload:{phoneStatus:response.code === 0}
      });
  },

  *checkUsername({payload}, { call, put }) {
      const response = yield call(checkUsername,payload);
      const result = response.code===0;
    //更新手机号是否可用的state
      yield put({
        type:'setStatus',
        payload:{usernameStatus:result}
      });
  },
  *sendSms({payload}, { call, put }){
    return yield call(sendSms, payload);
  },
  *checkSms({payload}, { call, put }){
    const response = yield call(checkSms, payload);
    //更新验证短信验证码的状态
    yield put({
      type:'setStatus',
      payload:{ smsCodeCheckState:response.code === 0 }
    });
  }
},

  reducers: {
    setStatus(state,{payload}) {
      return {
        ...state,
        ...payload
      }
    },
  },
};
