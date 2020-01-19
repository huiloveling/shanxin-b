import { stringify } from 'qs';
import request from '../../utils/request';

export async function list(params) {
  return request(`/api/salary/dissent/list?`+stringify(params));
}

export async function get(params) {
  return request(`/api/salary/dissent/get?`+stringify(params));
}

export async function save(params) {
  return request('/api/salary/dissent/save?'+stringify(params), {
    method: 'POST',
  });
}
