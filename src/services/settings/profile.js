import { stringify } from 'qs';
import request from '../../utils/request';

export async function list(params) {
  return request(`/api/user/list?${stringify(params)}`);
}

export async function get(params) {
  return request(`/api/user/get?${stringify(params)}`);
}

export async function updateContact(params) {
  return request('/api/user/update/contact?'+stringify(params), {
    method: 'POST',
  });
}

export async function updatePhone(params) {
  params = {
    ...params,
    requestId:'bizRegister',
  }
  return request('/api/user/update/phone?'+stringify(params), {
    method: 'POST',
  });
}
