import { stringify } from 'qs';
import request from '../../utils/request';

export async function download(params) {
  return request(`/api/salary/template/download?`+stringify(params));
}
