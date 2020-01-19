import { stringify } from 'qs';
import request from '../../utils/request';
import {arrToQueryString} from '../../utils/QueryStringUtil';

export async function list(params) {
  return request(`/api/salary/batch/list?${stringify(params)}`);
}

export async function get(params) {
  const queryString = arrToQueryString("state",params.state)+"&"+stringify(params)
  return request(`/api/salary/batch/get?${queryString}`);
}

export async function payroll(params) {
  return request(`/api/salary/payroll?${stringify(params)}`);
}

export async function errorList(params) {
  return request(`/api/salary/error/list?`+stringify(params));
}
