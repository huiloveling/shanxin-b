import { stringify } from 'qs';
import request from '../../utils/request';

export async function login(params) {
  //这里的${abc} 是es6的拼接字符串的新语法
  const url = `/api/account/login?${stringify(params)}`;
  return request(url, {
    method: 'POST',
  });
}
