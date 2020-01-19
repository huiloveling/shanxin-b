import { get as getUserInfo } from "../../services/settings/sysuser"
import { download } from "../../services/auth/download"
import { userInfoUtil as userUtil } from "../../utils/UserInfoUtil"
import { message } from "antd";

export default {
  namespace: 'auth',

  state: {},

  effects: {
    *updateUserInfo({_},{call}){
      const userInfo = userUtil.getCurrentUser();
      const response = yield call(getUserInfo, { id : userInfo.id });
      //检测用户认证状态，如果已经认证则更新用户信息
      if(response.code===0 && response.data && response.data.customer && response.data.customer.checkState==="1") {
        const newUserInfo = response.data;  //后台传来的其实是个包含部分信息的dto，所以不能直接设置，而是取出关键信息
        userInfo.bizCustomer = newUserInfo.customer;  //更新用户信息中的bizCustomer对象
        userInfo.menuList = newUserInfo.menuList;  //更新用户菜单
        userUtil.setCurrentUser(userInfo); //重新设置用户信息
        userUtil.setMenuList(userInfo.menuList);
        message.success("检测到您已经认证，正在跳转至首页...", 2, ()=>{window.location.href = "/home"})
      }else {
        message.error("已经更新用户信息，您仍未认证...")
      }

    },
    *download({_}, {call}){
      yield call(download);
    }
  },

  reducers: {}
};
