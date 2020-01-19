import { message } from 'antd';
import { all as allCompanies, list, resentSalaryList, get, save, updateManager, updateState, checkName } from '../../services/settings/company';
import { all as allManagers } from '../../services/settings/sysuser';

export default {
  namespace: 'company',

  state: {
    // companyStatus:true,  //企业状态正常时为真，否则设为假
    // companyManagerList:[],  //测试时使用的负责人集合
    // companyManager:"张三丰",  //企业当前负责人
    // companyManagerId:-1,  //企业当前负责人id
    // companyManagerSelecting:false,  //为负责人栏显示下拉框，否则显示普通文本
    // companyDetail:{},

    currentItem: {
      manager: {},
      createUser: {},
      updateUser: {}
    },
    allCompanies: [],
    allManagers: [],
    data: {},
  },

  effects: {
    *list({payload}, {call,put}) {
      const response = yield call(list,payload);
      yield put({
        type:"queryList",
        payload:{
          data:response.data,
        }
      });
    },

    *resentSalaryList({payload}, {call,put}) {
      const response = yield call(resentSalaryList,payload);
      yield put({
        type:"queryList",
        payload:{
          data:response.data,
        }
      });
    },

    *all({payload}, {call,put}) {
      const response = yield call(allCompanies,payload);
      yield put({
        type:"loadAllCompanies",
        payload:{
          data:response.data,
        }
      })
    },

    *detail({payload},{call,put}) {
      const response = yield call(get,payload);
      yield put({
        type:'loadItem',
        payload: response.data
      });
    },

    *allManagers({payload},{call,put}) {
      const response = yield call(allManagers,payload);
      yield put({
        type:'loadAllManagers',
        payload:{
          data:response.data,
        }
      });
    },

    *updateManager({payload},{call,put}) {
      const response = yield call(updateManager,payload);
      if(response.code === 0) {
        yield put({
          type:'setCompanyManager',
          payload
        });
        message.success("修改成功！")
      }else {
        message.error("修改失败！"+response.msg)
      }
    },

    *updateState({payload},{call,put}) {
      const response = yield call(updateState,payload);
      if(response.code === 0) {
        yield put({
          type:'setCompanyStatus',
          payload
        });
        message.success("修改成功！")
      }else {
        message.error("修改失败！"+response.msg)
      }
    },

    *save({payload},{call, select}) {
      const item = yield select(({ modalModel }) => modalModel.currentItem);
      payload = { ...payload, id: item.id };
      const response = yield call(save,payload);

      if(response.code === 0) {
        message.success("操作成功！");
      }else {
        message.error("操作失败！"+response.msg);
      }
    },

    *check({payload}, {call, select}){
      const item = yield select(({ modalModel }) => modalModel.currentItem)
      console.log("item", item);
      payload = { ...payload, id: item.id }
      return yield call(checkName, payload);
    },
  },

  reducers: {
    queryList(state,{ payload }) {
        console.log(state);
      return {
        ...state,
        ...payload
      }
    },

    loadAllCompanies(state,{payload}) {
      return {
        ...state,
        allCompanies: payload.data,
      }
    },
    // setCompanyStatus(state,{payload}) {
    //   return {
    //     ...state,
    //     companyStatus:payload.companyStatus,
    //   }
    // },
    // setCompanyManager(state,{payload}) {
    //   return {
    //     ...state,
    //     companyManager:payload.companyManager,
    //   }
    // },
    setCompanyManagerSelecting(state,{payload}) {
      return {
        ...state,
        companyManagerSelecting:payload.companyManagerSelecting,
      }
    },
    loadItem(state,{payload}) {
      return {
        ...state,
        currentItem: payload,
      }
    } ,
    loadAllManagers(state,{payload}) {
      return {
        ...state,
        allManagers: payload.data,
      }
    }
  }
};
