import { uploadFile, checkList, salaryConfirm } from '../../services/salary/salaryUpload';
import { all as allCompanies } from '../../services/settings/company';
import { message } from 'antd';

export default {
  namespace: 'salaryUpload',

  state: {
    lastState:{},  //用于点击上一步时返回之前的状态
    uploadTemplate:true,  //为真上传样本，否则上传工资表
    formValues:{},
    data: {},
    companyList: [],
    batch: ''
  },

  effects: {
    *init({payload},{put, call, select}){
      const {code, data:companyList, msg} = yield call(allCompanies, {})
      if (code == 0) {
        yield put({
          type:"saveData",
          payload:{companyList}
        });
      } else {
        message.error(msg, 1);
      }
    },

    *uploadSalaryFile({payload},{put, call, select}){
      const res = yield call(uploadFile, payload)
      const {code, data, msg} = res;
      console.log("saveDate==============================",res);
      if (code == 0) {
        const {code, data:{salaryBatch, salaryDetailList, salaryTemplateFields}, msg} = yield call(checkList, {batch:data.batch, companyId: payload.companyId});
        if (code == 0) {
          yield put({
            type:"saveData",
            payload:{batch: data.batch, salarySum:data.salarySum, salaryBatch, salaryDetailList, salaryTemplateFields}
          });
        } else {
          console.log('saveData===', msg);
          yield put({
            type:"saveData",
            payload:{batch: data.batch, salarySum:data.salarySum}
          });
        }
      }  else if(code != 2){
        message.error(msg, 1);
      }
      return res;
    },

    *querySalaryDetail({payload},{put, call, select}){
      const {code, data:{salaryBatch, salaryDetailList, salaryTemplateFields}, msg} = yield call(checkList, payload)
      if (code == 0) {
        yield put({
          type:"saveData",
          payload:{
            salaryBatch,
            salaryDetailList,
            salaryTemplateFields,
          }
        });
      } else {
        message.error(msg, 1);
      }
    },

    *confirm({payload},{put, call}){
      const response = yield call(salaryConfirm, payload)
      if (response.code == 0) {
        yield put({
          type:"saveData",
          payload:{step: 4}
        });
      } else {
        message.error(response.msg, 1);
        yield put({
          type:"saveData",
          payload:{step: 3}
        });
      }
      return response;
    },
  },

  reducers: {
    setFormValues(state, {payload}) {
      return {
        ...state,
        formValues:payload.formValues,
      }
    },

    saveData(state, {payload}){
      return{
        ...state,
        ...payload
      }
    }
  }
};
