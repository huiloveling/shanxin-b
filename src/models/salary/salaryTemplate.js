import { download } from '../../services/salary/salaryTemplate';

export default {
  namespace: 'salaryTemplate',

  state: {
    data: {},
  },

  effects: {
    *download({payload}, {call,put,select}) {
      yield call(download,payload);
    }
  },

};
