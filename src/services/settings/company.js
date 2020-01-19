import { stringify } from 'qs';
import request from '../../utils/request';

export async function list(params) {
  return request(`/api/company/list?${stringify(params)}`);
}

export async function resentSalaryList(params) {
  return request(`/api/company/resentSalaryList?${stringify(params)}`);
}

export async function all(params) {
  return request(`/api/company/all?${stringify(params)}`);
}

export async function get(params) {
  return request(`/api/company/get?${stringify(params)}`);
}

export async function updateManager(params) {
  return request(`/api/company/update/manager?${stringify(params)}`, {
    method:"POST",
  });
}

export async function updateState(params) {
  return request(`/api/company/update/state?${stringify(params)}`, {
    method:"POST",
  });
}

export async function save(params) {
  return request('/api/company/save?'+stringify(params), {
    method: 'POST',
    body:params.formData,
  });
}

export async function checkName(params) {
  return request(`/api/company/checkName?${stringify(params)}`);
}

