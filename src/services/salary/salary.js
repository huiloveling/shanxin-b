import request from '../../utils/request';

export async function paySalary(params) {
  return request('/api/salary/pay', {
    method: 'POST',
    body: params,
  });
}
