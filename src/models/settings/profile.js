import { message, Modal } from 'antd';
import { list, updatePhone, updateContact} from '../../services/settings/profile';
import { userInfoUtil } from '../../utils/UserInfoUtil';

export default {
  namespace: 'profile',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *list({payload},{call,put}) {
      const response = yield call(list,payload);
      yield put({
        type:'queryList',
        payload:{
          data:response.data
        }
      })
    },

    *updateContact({payload},{call}) {
      console.log("aaaaaaaaaaaaaaaaa")
      const response = yield call(updateContact,payload);
      if(response.code===0) {
        message.success("修改成功");
        //修改本地存储中的用户名
        const userInfo = userInfoUtil.getCurrentUser();
        userInfo.realName = payload.contact;
        userInfoUtil.setCurrentUser(userInfo)
      }else {
        message.error("修改失败！" + response.msg)
      }
    },

    *updatePhone({payload},{call}) {
      const response = yield call(updatePhone,payload);
      if(response.code===0) {
        Modal.success({
          title:'修改成功',
          content:'您现在可以使用新的手机号了!'
        })
        //更新本地存储中的用户信息
        const userInfo = userInfoUtil.getCurrentUser();
        const newUserInfo = {
          ...userInfo,
          phone:payload.phone,
        };
        userInfoUtil.setCurrentUser(newUserInfo);
      }else {
        Modal.error({
          title:'修改失败',
          content:response.msg,
        })
      }
    }
  },

  reducers: {
    queryList(state,{payload}) {
      return {
        ...state,
        ...payload
      }
    },
  }
};
