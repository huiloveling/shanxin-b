import { stringify } from 'qs';
import request from '../../utils/request';

export async function update(params) {
  return request('/api/account/changePassword?'+stringify(params), {
    method: 'POST',
  });
}
