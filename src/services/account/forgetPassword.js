import { stringify } from 'qs';
import request from '../../utils/request';

export async function update(params) {
  params = {
    ...params,
    requestId:'bizRegister',
  }
  return request('/api/account/findPassword?'+stringify(params), {
    method: 'POST',
  });
}
