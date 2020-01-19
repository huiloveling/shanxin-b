/**
 * 用于存放 model 中的 effect 和 reducer 名字，以及在多处使用的常量
 */
let baseUrl = '';
if (process.env.NODE_ENV == 'development') {
    baseUrl = 'http://localhost:8081';
  // baseUrl = "http://biz-api.xindongkj.com";
  // baseUrl = 'https://biz-api.zhqianbao.com';
}else{
    baseUrl = "http://biz-api.xindongkj.com";
  // baseUrl = 'https://biz-api.zhqianbao.com';
}
export const cons={
  url:{
    // base_url: 'http://192.168.0.115:8080',
    base_url: baseUrl,
  },
}
