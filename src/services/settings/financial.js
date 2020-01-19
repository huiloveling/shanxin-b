import request from '../../utils/request';

export async function detail() {
  console.log("detail方法调用了啊啊啊啊");
  return request(`/api/finance/detail`);
}
