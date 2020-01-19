import {isUrl} from '../utils/utils';
import {userInfoUtil} from '../utils/UserInfoUtil'

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map((item) => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => {
  //在这检测localStorage中的用户认证状态，决定使用哪个menuData
// console.log("menuDaga:" ,userInfoUtil.getCurrentUser() )
  const user = userInfoUtil.getCurrentUser();
  const isChecked = user&&user.bizCustomer&&user.bizCustomer.checkState=="1";
  const menuList = userInfoUtil.getMenuList() || [];
  const menuData = !isChecked?[{
    name: '企业认证',
    path: 'auth',
  },] : menuList;
  return formatter(menuData)
};
