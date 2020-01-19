/**
 *  将数组转化为查询字符串
 *  输出格式为 keyName=1&keyName=2
 *  此方法用于解决qs.stringify(arr) 时出现的输出为 arr[0]=1&arr[1]=2 的bug，
 * @param keyName
 * @param arr
 * @returns {string}
 */
export function arrToQueryString(keyName, arr) {
  if(!arr)
    return;
  let result = "";
  for(let i=0; i<arr.length; i++) {
    result+=keyName+"="+arr[i]+"&";
  }
  return result.substring(0,result.length-1);
}
