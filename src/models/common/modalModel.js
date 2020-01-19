export default {
  namespace: 'modalModel',

  state: {
    modalVisible: false,  //modal是否可见
    currentItem: {}
  },

  reducers: {
    showModal(state,{payload = {}}) {
      return {
        ...state,
        modalVisible: true,
        currentItem: payload
      };
    },

    hideModal(state){
      return {
        ...state,
        modalVisible: false,
      };
    },
  }
};
