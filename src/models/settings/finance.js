
import { detail,} from '../../services/settings/finance';

export default {
  namespace: 'finance',

  state: {
      data: {},
  },

  effects: {
      *query({ payload },{ call,put }) {
          const response = yield call(detail, payload);
          console.log(response);
          yield put({
              type:'history/details',
              payload:{
                  data:response.data,
              }
          });
          return response;
       }
  },

  reducers: {
    'history/details'(state,{payload}) {
        console.log(payload);
        console.log(state);
        return {
            ...state,
            data: payload.data
        }
    },
  }
};
