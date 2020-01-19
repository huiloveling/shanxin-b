import { stringify } from 'qs';
import request from '../../utils/request';
import {arrToQueryString} from '../../utils/QueryStringUtil';

export async function all(params) {
  return request(`/api/user/all?${stringify(params)}`);
}

export async function list(params) {
  // const queryString = arrToQueryString("state",params.userState)+"&"+stringify(params)
  // return request(`/api/user/list?`+queryString);
  return request(`/api/user/list?${stringify(params)}`);
}

export async function get(params) {
  // console.table(params);
  return request(`/api/user/get?${stringify(params)}`);
}

export async function save(params) {
  const queryString = arrToQueryString("companyIds",params.companyIds);
  return request('/api/user/save?'+queryString, {
    method: 'POST',
    body:params.bizUser
  });
}

export async function updateState(params) {
  return request('/api/user/update/state?'+stringify(params),{
    method:'POST'
  });
}

export async function resetPassword(params) {
  return request('/api/user/reset/password?'+stringify(params),{
    method:'POST'
  });
}
