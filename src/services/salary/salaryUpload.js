import {stringify} from 'qs';
import request from '../../utils/request';

export async function uploadFile(params) {
  let formData = new FormData();
  for (let key in params) {
    formData.append(key, params[key]);
  }
  return request('/api/salary/upload/uploadFile', {
    method: 'POST',
    body: formData,
  });
}

export async function checkList(params) {
  return request(`/api/salary/upload/checkList?${stringify(params)}`);
}

export async function salaryConfirm(params) {
  let formData = new FormData();
  for (let key in params) {
    formData.append(key, params[key]);
  }
  return request(`/api/salary/upload/confirm`, {
    method: 'POST',
    body: formData,
  });
}
