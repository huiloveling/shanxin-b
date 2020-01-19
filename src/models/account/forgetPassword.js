import {update} from '../../services/account/forgetPassword';
import {routerRedux} from 'dva/router';
import {message} from 'antd';

export default {
  namespace: 'forgetPassword',

  state: {

  },

  effects: {
    *submit({payload}, { call, put }) {
      const response = yield call(update,payload);
      if (response.code === 0) {
        message.success("请使用新密码重新登录!")
        yield put(routerRedux.push('/account'));  //执行跳转操作
      }else{
        message.error(response.msg,5,()=>{})
      }
    },

  *checkPhone({payload}, { call, put }) {
      const response = yield call(checkPhone,payload);
    //更新手机号是否可用的state
      yield put({
        type:'setPhoneStatus',
        payload:{phoneStatus:response.code === 0}
      });
  },

},

  reducers: {

  }
};
