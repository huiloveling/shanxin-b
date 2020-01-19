import { stringify } from 'qs';
import request from '../../utils/request';

export async function companyValidCount(params) {
  return request(`/api/company/validCount?`+stringify(params));
}

export async function empValidCount(params) {
  return request(`/api/emp/validCount?`+stringify(params));
}

export async function salaryStatLastMonth(params) {
  return request(`/api/salary/batch/stat/lastMonth?`+stringify(params));
}

export async function salaryStat(params) {
  return request(`/api/salary/detail/stat?`+stringify(params));
}





