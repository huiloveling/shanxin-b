import request from '../../utils/request';

export async function download() {
  return request("/api/customer/download");
}
