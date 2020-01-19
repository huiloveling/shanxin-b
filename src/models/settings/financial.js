import { detail,} from '../../services/settings/financial';

export default {
  namespace: 'financial',

  state: {},

  effects: {
    *details({ payload },{ call,put }) {
      const response = yield call(detail, payload);
      yield put({
        type:'detailList',
        payload:{
          financialList:response.data
        }
      });
      return response;
    }
  },

  reducers: {
    detailList(state,{payload}) {
      return {
        ...state,
        financialList:payload.financialList,
      }
    },
  }
};
