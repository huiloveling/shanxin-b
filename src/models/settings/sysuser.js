import { message, Modal } from 'antd';
import { list, save, updateState,resetPassword} from '../../services/settings/sysuser';
import { all as allCompanies } from '../../services/settings/company';

export default {
  namespace: 'sysuser',

  state: {
    companyList:[],  //企业列表，transfer控件使用
    targetKeys:[],  //选中的企业，transfer控件使用
    userState:["1"],  // 用于指示当前正在显示哪个状态的用户表格，1 启用， 2 禁用，初始值为 1，即显示启用的用户

    data: {},
  },

  effects: {
    *list({ payload },{ call,put }) {
      const response = yield call(list, payload);
      yield put({
        type:'queryList',
        payload:{
          data:response.data
        }
      })
    },

    *save({payload},{call,put}) {
      const response = yield call(save,payload);
      yield put({
        type:"modalModel/hideModal"
      })
      if(response.code===0) {
        Modal.success({
          title:'添加成功',
        })
      }else {
        Modal.error({
          title:'添加失败！'+response.msg,
        })
      }
    },

    //获取用户所有的公司
    *fetchCompanyList({payload}, {call,put}) {
      const response = yield call(allCompanies,payload);
      yield put({
        type:"setCompanyList",
        payload:{
          companyList:response.data,
        }
      })
    },

    *updateState({payload}, {call,pull}) {
      yield call(updateState,payload);
    },

    *resetPassword({payload}, {call}) {
      const response = yield call(resetPassword,payload);
      if(response.code===0) {
        message.success("重置成功！")
      }else{
        message.error("重置失败！"+response.msg)
      }

    },
  },

  reducers: {
    queryList(state,{payload}) {
      return {
        ...state,
        ...payload
      }
    },

    setUserState(state, {payload}){
      return {
        ...state,
        userState:payload.userState,
      }
    },

    setCompanyList(state,{payload}) {
      return {
        ...state,
        companyList:payload.companyList,
      }
    },

    setTargetKeys(state,{payload}) {
      const result={
        ...state,
        targetKeys:payload.targetKeys,
      }
      return result;
    },
  }
};
