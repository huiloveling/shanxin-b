// import stores from 'store2';  //使用store2 , 其实还有个叫做 store js包，那个可以设置存储的过期时间
//
// var remmberMe;  // "1" 意味着勾选了“记住我”，否则就是没勾选
// var store; // 用于指示使用那个store, stores.local 为本地永久存储，stores.session为会话存储
const userKey = "currentUser";  //用户信息的键名
const remmberMeKey = "remmberMe";  //用户是否勾选了“记住我” 的那个flag的键名
/**
 * 用于存储用户信息的工具类
 * @author z
 * store2 on github: https://github.com/nbubna/store
 */
class UserInfoUtil {
  /**
    构造器，初始化参数
   */
  constructor() {
    // remmberMe = stores.local.get(remmberMeKey);  //if user checked remmberMe , remmberMe == "1", then use localStorage
    // store = remmberMe=="1"?stores.local:stores.session;  //use localStorage or sessionStorage by remmberMe flag
    // store = stores.local;
  }

  /**
   * 检测本地是否已经有用户的登录信息
   * @returns {any|boolean}
   */
  wasLogin() {
    return !!this.getCurrentUser();
  }

  /**
   * 设置用户信息
   * @param userInfo
   */
  setCurrentUser(userInfo) {
    sessionStorage.setItem(userKey, JSON.stringify(userInfo));
    // localStorage.setItem("menuList", userInfo ? JSON.stringify(userInfo.menuList) : [])
    // store.set(userKey,userInfo);
    // stores.local.set("menuList",userInfo ? userInfo.menuList : [])
  }

  setMenuList(menuList) {
    sessionStorage.setItem("menuList", menuList?JSON.stringify(menuList):'');
  }

  /**
   * 获取用户信息
   * @returns {any}
   */
  getCurrentUser() {
    let user;
    if (localStorage.getItem(remmberMeKey)) {
      user = localStorage.getItem(userKey)
    } else {
      user = sessionStorage.getItem(userKey)
    }
    return JSON.parse(user);
  }

  /**
   * 用于登录之后存储用户信息到本地的方法
   * @param remmberMeFlag  是否勾选了“记住我”的flag，勾了为true，否则为false
   * @param userInfo 用户信息
   */
  save(remmberMeFlag, userInfo) {
    if (remmberMeFlag) {
      localStorage.setItem(remmberMeKey, remmberMeFlag);
      localStorage.setItem(userKey, JSON.stringify(userInfo));
    } else {
      sessionStorage.setItem(userKey, JSON.stringify(userInfo));
    }
    localStorage.setItem("menuList", userInfo ? JSON.stringify(userInfo.menuList) : null)
  }

  /**
   * 清除当前存储空间中的信息，若想清除所有存在本地的数据，直接使用stores.clearAll()即可
   */
  clear() {
    localStorage.clear();
    sessionStorage.clear();
  }

  getMenuList(){
    return JSON.parse(localStorage.getItem("menuList"));
  }
}

export const userInfoUtil = new UserInfoUtil();
