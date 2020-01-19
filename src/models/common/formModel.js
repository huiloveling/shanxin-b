export default {
  namespace: 'formModel',

  state: {
    formValues:{},
  },

  effects: {
  },

  reducers: {
    setFormValues(state, {payload}) {
      return {
        ...state,
        formValues:payload.formValues,
      }
    }
  }
};
