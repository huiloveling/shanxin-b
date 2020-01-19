import request from '../../utils/request';
import { stringify } from 'qs';

export async function list(params) {
  return request("/api/cms/article/list?"+stringify(params))
}

export async function detail(params) {
  return request("/api/cms/article/detail?"+stringify(params))
}
