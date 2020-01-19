import {createElement} from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import {getMenuData} from './menu';

let routerDataCache;

const modelNotExisted = (app, model) => (
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  })
);

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach((model) => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return (props) => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () => models.filter(
      model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)
    ),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then((raw) => {
        const Component = raw.default || raw;
        return props => createElement(Component, {
          ...props,
          routerData: routerDataCache,
        });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach((item) => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = (app) => {
  const routerConfig = {
    '/backIndex': {
      component: dynamicWrapper(app, ['user','account/register','account/login','common/modalModel','common/formModel'], () => import('../layouts/BasicLayout')),
    },
    '/account': {
      component: dynamicWrapper(app, [], () => import('../layouts/AccountLayout')),
    },
    '/account/login': {
      name:'登录',
      component: dynamicWrapper(app, [], () => import('../routes/Account/Login')),
    },
    '/account/logout': {
      component: dynamicWrapper(app, [], () => import('../routes/Account/Logout')),
    },
    '/account/register': {
      name:'注册',
      component: dynamicWrapper(app, [], () => import('../routes/Account/Register')),
    },
    '/user/register-result': {
      component: dynamicWrapper(app, [], () => import('../routes/Account/RegisterResult')),
    },
    '/account/forgetPassword': {
      name: '忘记密码',
      component: dynamicWrapper(app, ['account/forgetPassword'], () => import('../routes/Account/ForgetPassword')),
    },
    '/updatePassword/:userid': {
      name: '更新密码',
      component: dynamicWrapper(app, ['account/updatePassword'], () => import('../routes/Settings/Profile/UpdatePassword')),
    },
    '/auth': {
      name: '企业认证',
      component: dynamicWrapper(app, ['auth/auth'], () => import('../routes/Auth')),
    },
     '/auth/show': {
      name: '企业认证',
      component: dynamicWrapper(app, [], () => import('../routes/Auth/AuthShow')),
    },
    '/home': {
      component: dynamicWrapper(app, ['home/stat'], () => import('../routes/Home')),
    },
    '/home/list': {
      component: dynamicWrapper(app, [], () => import('../routes/Home/HomeList')),
    },
    '/home/nocompany': {
      name: '添加企业',
      component: dynamicWrapper(app, [], () => import('../routes/Home/NoCompany/NoCompany')),
    },
    '/notice': {
      name: '公告',
      component: dynamicWrapper(app, ['dashboard/notice'], () => import('../routes/Home/Notice')),
    },
    '/notice/list': {
      name: '公告列表',
      component: dynamicWrapper(app, [], () => import('../routes/Home/Notice/NoticeList')),
    },
    '/notice/detail/:id': {
      name: '公告详情',
      component: dynamicWrapper(app, [], () => import('../routes/Home/Notice/NoticeDetail')),
    },
    '/salary/salaryUpload': {
      name: '上传工资表',
      component: dynamicWrapper(app, ['salary/salaryUpload'], () => import('../routes/Salary/SalaryUpload')),
    },
    '/salary/salaryUpload/upload': {
      name: '上传工资表',
      component: dynamicWrapper(app, [], () => import('../routes/Salary/SalaryUpload/SalaryUpload')),
    },
    '/salary/salaryPay': {
      name: '薪资发放',
      component: dynamicWrapper(app, ['salary/salaryPay'], () => import('../routes/Salary/SalaryPay')),
    },
    '/salary/salaryPay/list': {
      name: '待发薪列表',
      component: dynamicWrapper(app, [], () => import('../routes/Salary/SalaryPay/SalaryPay')),
    },
    '/salary/salaryPay/detail/:batchId/:companyId': {
      name: '发薪详情',
      component: dynamicWrapper(app, [], () => import('../routes/Salary/SalaryPay/SalaryPayDetail')),
    },
    '/salary/salaryHistory': {
      name: '工资历史',
      component: dynamicWrapper(app, ['salary/salaryHistory','salary/salaryHistoryDetail'], () => import('../routes/Salary/SalaryHistory')),
    },
    '/salary/salaryHistory/list': {
      name: '工资历史列表',
      component: dynamicWrapper(app, [], () => import('../routes/Salary/SalaryHistory/SalaryHistory')),
    },
    '/salary/salaryHistory/detail/:batchId/:companyId': {
      name: '工资历史详情',
      component: dynamicWrapper(app, [], () => import('../routes/Salary/SalaryHistory/SalaryHistoryDetail')),
    },
    '/salary/salaryDissent': {
      name: '工资异议',
      component: dynamicWrapper(app, ['salary/salaryDissent','salary/salaryDissentDetail'], () => import('../routes/Salary/SalaryDissent')),
    },
    '/salary/salaryDissent/dissent': {
      name: '工资异议列表',
      component: dynamicWrapper(app, [], () => import('../routes/Salary/SalaryDissent/SalaryDissent')),
    },
    '/salary/salaryDissent/detail/:salaryId': {
      name: '工资异议详情',
      component: dynamicWrapper(app, [], () => import('../routes/Salary/SalaryDissent/SalaryDissentDetail')),
    },
    '/settings/company': {
      name: '企业管理',
      component: dynamicWrapper(app, ['settings/company', 'salary/salaryTemplate'], () => import('../routes/Settings/Company')),
    },
    '/settings/company/add': {
      name: '添加企业',
      component: dynamicWrapper(app, [], () => import('../routes/Settings/Company/CompanyList')),
    },
    '/settings/company/list': {
      name: '企业列表',
      component: dynamicWrapper(app, [], () => import('../routes/Settings/Company/CompanyList')),
    },
    '/settings/company/manager/:managerId': {
      name: '企业管理',
      component: dynamicWrapper(app, [], () => import('../routes/Settings/Company/CompanyList')),
    },
    '/settings/company/detail/:id': {
      name: '发薪记录',
      component: dynamicWrapper(app, ['settings/company','salary/salaryHistory'], () => import('../routes/Settings/Company/CompanyDetail')),
    },
    '/settings/company/emps/:id': {
      name: '员工列表',
      component: dynamicWrapper(app, ['settings/company','salary/salaryHistory', 'settings/emp'], () => import('../routes/Settings/Company/EmpList')),
    },
    '/settings/sysuser': {
      name: '用户管理',
      component: dynamicWrapper(app, ['settings/sysuser'], () => import('../routes/Settings/SysUser')),
    },
    '/settings/sysuser/list': {
      name: '用户列表',
      component: dynamicWrapper(app, [], () => import('../routes/Settings/SysUser/SysUserList')),
    },
    '/profile': {
      name: '基本资料',
      component: dynamicWrapper(app, ['settings/profile'], () => import('../routes/Settings/Profile/')),
    },
    '/profile/list': {
      name: '基本资料',
      component: dynamicWrapper(app, [], () => import('../routes/Settings/Profile/ProfileList')),
    },
    '/settings/financial': {
      name: '财务详情',
      component: dynamicWrapper(app, ['settings/financial'], () => import('../routes/Settings/Financial')),
    },
    '/settings/financial/list': {
      name: '财务详情',
      component: dynamicWrapper(app, [], () => import('../routes/Settings/Financial/FinancialList')),
    },
    '/settings/historyDetail': {
      name: '历史详情',
      component: dynamicWrapper(app, ['settings/finance'], () => import('../routes/Settings/HistoryDetail')),
    },
    '/settings/historyDetail/list': {
      name: '历史详情',
      component: dynamicWrapper(app, [], () => import('../routes/Settings/HistoryDetail/HistoryDetail')),
    },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach((path) => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
    };
    routerData[path] = router;
  });
  return routerData;
};
