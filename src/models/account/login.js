import {login} from '../../services/account/login';
import {userInfoUtil} from '../../utils/UserInfoUtil';
import stores from 'store2';
import {message} from 'antd';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(login, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response.code === 0) {
        const user = response.data;
        //检测用户状态是否是停用，如果是停用则不保存用户信息，同时提示用户账号已停用
        if(user.state==="0") {
          message.error("该账号已被停用！");
          return;
        }
        //账号若为启用状态则检测认证状态，跳转到对应页面
        yield userInfoUtil.save(payload.autoLogin,response.data); //存储用户信息
        //在这里要在调（customer）接口查询用户是否已经认证，如果已经认证的话就跳转到主页否则就跳转到认证页面
        if(user && user.bizCustomer.checkState==="0") {
          window.location.href ='/auth' ;  //已经认证，跳转到home
        }else {
          // yield put(routerRedux.push('/home/list'));  //已经认证，跳转到home
          window.location.href ='/home/list' ;  //已经认证，跳转到home
        }
      }else{
        message.error(response.msg,5,()=>{})
      }
    },

    *logout(_, { }) {
      yield stores.clearAll(); // 清除本地用户信息
      window.location.href = '/account/login';  //跳转到登录页
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      // setAuthority(payload.data.roleId);
      return {
        ...state,
        status: payload.code,
        type: payload.type,
      };
    },
  },
};
