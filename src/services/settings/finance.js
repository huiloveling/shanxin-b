import { stringify } from 'qs';
import request from '../../utils/request';

export async function detail(params) {
  return request(`/api/finance/history/details?${stringify(params)}`);
}
