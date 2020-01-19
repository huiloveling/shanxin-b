import request from '../../utils/request';
import { stringify } from 'qs';

export async function register(params) {
  params = {
    ...params,
    requestId: 'bizRegister',
  }
  return request('/api/account/register?'+stringify(params), {
    method: 'POST',
  });
}

export async function checkPhone(params) {
  return request('/api/account/checkPhone?'+stringify(params));
}

export async function checkUsername(params) {
  return request('/api/account/checkUsername?'+stringify(params));
}
export async function sendSms({phone, imageCode: code}) {
  const requestId = 'bizRegister';
  return request('/api/common/captcha/sms?'+stringify({requestId, phone, code}), {method: 'POST'});
}
export async function checkSms({phone, code}) {
  const requestId = 'bizRegister';
  return request('/api/common/captcha/sms/check?'+stringify({requestId, phone, code}), {method: 'POST'});
}
