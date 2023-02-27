/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import FcMenu, { IMenuProps } from '@fc-components/menu';
import React, { FC, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, Button } from 'antd';
import Icon, { AimOutlined, AlertOutlined, LineChartOutlined, CodeOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import querystring from 'query-string';
import { dynamicPackages, Entry } from '@/utils';
import { getMenuPerm } from '@/services/common';
import { RootState as AccountRootState, accountStoreState } from '@/store/accountInterface';
import IconFont from '../IconFont';
import './menu.less';

const { SubMenu } = Menu;
const Packages = dynamicPackages();
let lazyMenu = Packages.reduce((result: any, module: Entry) => {
  const menu = module.menu;
  return menu ? (result = result.concat(menu)) : result;
}, []);
const getDefaultOpenKey = (menus: any, pathname) => {
  const currentSubMenu = _.find(menus, (subMenus: any) => {
    return _.some(
      subMenus.children.filter((i) => !!i),
      (menu) => {
        return pathname.indexOf(menu.key) !== -1;
      },
    );
  });
  if (currentSubMenu) {
    return currentSubMenu.key;
  }
};
const defaultSelectedKey = (menus: any, pathname) => {
  let key;
  _.forEach(menus, (subMenus: any) => {
    _.forEach(subMenus.children, (menu: any) => {
      if (menu && pathname.indexOf(menu.key) !== -1) {
        key = menu.key;
      }
    });
  });
  return key;
};

const SideMenu: FC = () => {
  const { t, i18n } = useTranslation();
  const [defaultSelectedKeys, setDefaultSelectedKeys] = useState<string[]>();
  const menuList = [
    {
      key: 'targets',
      icon: <AimOutlined />,
      label: t('监控对象'),
      children: [
        {
          key: '/targets',
          label: t('对象列表'),
        },
      ],
    },
    {
      key: 'monitor',
      icon: <LineChartOutlined />,
      label: t('监控看图'),
      children: [
        {
          key: '/metric/explorer',
          label: t('即时查询'),
        },
        {
          key: '/object/explorer',
          label: t('快捷视图'),
        },
        {
          key: '/dashboards',
          label: t('监控大盘'),
        },
      ],
    },
    {
      key: 'alarm',
      icon: <AlertOutlined />,
      label: t('告警管理'),
      children: [
        {
          key: '/alert-rules',
          label: t('告警规则'),
        },
        {
          key: '/recording-rules',
          label: t('记录规则'),
        },
        {
          key: '/alert-mutes',
          label: t('屏蔽规则'),
        },
        {
          key: '/alert-subscribes',
          label: t('订阅规则'),
        },
        {
          key: '/alert-cur-events',
          label: t('活跃告警'),
        },
        {
          key: '/alert-his-events',
          label: t('历史告警'),
        },
      ],
    },
    {
      key: 'job',
      icon: <CodeOutlined />,
      label: t('告警自愈'),
      children: [
        {
          key: '/job-tpls',
          label: t('自愈脚本'),
        },
        {
          key: '/job-tasks',
          label: t('执行历史'),
        },
      ],
    },
    {
      key: 'manage',
      // icon: <UserOutlined />,
      icon: <IconFont type='icon-renyuanzuzhi-weixuanzhongyangshi' />,
      label: t('人员组织'),
      children: [
        {
          key: '/users',
          label: t('用户管理'),
        },
        {
          key: '/user-groups',
          label: t('团队管理'),
        },
        {
          key: '/busi-groups',
          label: t('业务组管理'),
        },
      ],
    },
    {
      key: 'help',
      // icon: <Icon component={SystemInfoSvg as any} />,
      icon: <IconFont type='icon-xitongxinxi-weixuanzhongyangshi' />,
      label: t('系统信息'),
      children: [
        {
          key: '/help/version',
          label: t('系统版本'),
        },
        // {
        //   key: '/help/contact',
        //   label:t('联系我们'),
        // },
        {
          key: '/help/migrate',
          label: t('管理员迁移'),
        },
        {
          key: '/help/servers',
          label: t('告警引擎'),
        },
        ...[
          import.meta.env.VITE_IS_DS_SETTING
            ? {
                key: '/help/source',
                label: t('数据源管理'),
              }
            : undefined,
        ],
      ],
    },
  ];

  const [menus, setMenus] = useState(menuList);

  useEffect(() => {
    setDefaultSelectedKeys([]);
    for (const item of menuList) {
      if (item && item.key.startsWith('/') && window.location.pathname.includes(item.key)) {
        setDefaultSelectedKeys([item?.key]);
        break;
      } else if (item?.children && item.children.length > 0) {
        for (const i of item.children) {
          if (i && window.location.pathname.includes(i.key!)) {
            setDefaultSelectedKeys([item?.key, i.key!]);
            break;
          }
        }
      }
    }
  }, []);

  const history = useHistory();
  const location = useLocation();
  const { pathname } = location;
  let { profile } = useSelector<AccountRootState, accountStoreState>((state) => state.account);
  const [collapsed, setCollapsed] = useState<'0' | '1' | '2' | string | null>(localStorage.getItem('menuCollapsed'));
  // full => '0'
  // semi => '1'
  // skim => '2'
  const [selectedKeys, setSelectedKeys] = useState<string[]>([defaultSelectedKey(menus, pathname)]);
  const [openKeys, setOpenKeys] = useState<string[]>(collapsed ? [] : [getDefaultOpenKey(menus, pathname)]);

  const switchCollapsed = () => {
    if (!isNaN(Number(collapsed))) {
      const newColl = (Number(collapsed) === 2 ? -1 : Number(collapsed)) + 1 + '';
      setCollapsed(newColl);
      localStorage.setItem('menuCollapsed', newColl);
    } else {
      setCollapsed('1');
      localStorage.setItem('menuCollapsed', '1');
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
  };
  const handleClick = (key) => {
    if (location.pathname === key) return;
    setSelectedKeys([key as string]);
    // 写两个key as string 感觉有点傻
    if (key === 'changeLanguage') {
      let language = i18n.language == 'en' ? 'zh' : 'en';
      i18n.changeLanguage(language);
      localStorage.setItem('language', language);
    }

    if ((key as string).startsWith('/')) {
      history.push(key as string);
    }
  };
  const hideSideMenu = () => {
    if (
      location.pathname === '/login' ||
      location.pathname.startsWith('/chart/') ||
      location.pathname.startsWith('/dashboards/share/') ||
      location.pathname === '/callback' ||
      location.pathname.indexOf('/polaris/screen') === 0
    ) {
      return true;
    }
    // 大盘全屏模式下也需要隐藏左侧菜单
    if (location.pathname.indexOf('/dashboard') === 0) {
      const query = querystring.parse(location.search);
      if (query?.viewMode === 'fullscreen') {
        return true;
      }
      return false;
    }
    return false;
  };

  useEffect(() => {
    setSelectedKeys([defaultSelectedKey(menus, pathname)]);
    if (!collapsed) {
      setOpenKeys(_.union([...openKeys, getDefaultOpenKey(menus, pathname)]));
    }
  }, [pathname, collapsed]);

  useEffect(() => {
    if (profile.roles.length > 0) {
      if (profile.roles.indexOf('Admin') === -1) {
        getMenuPerm().then((res) => {
          const { dat } = res;
          const newMenus = [...menuList];
          newMenus.forEach((menu) => {
            menu.children = menu.children.filter((item) => item && dat.includes(item.key));
          });
          setMenus(newMenus);
        });
      } else {
        setMenus(menuList);
      }
    }
  }, [profile.roles]);

  return hideSideMenu() ? null : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 0 10px 10px',
      }}
    >
      {collapsed !== '2' && (
        <div className={`home ${collapsed === '1' ? 'collapse' : ''}`}>
          <div className='name' onClick={() => history.push('/metric/explorer')} key='overview'>
            <img src={collapsed === '1' ? '/image/logo.svg' : '/image/logo-l.svg'} alt='' className='logo' />
          </div>
        </div>
      )}
      {defaultSelectedKeys && (
        <FcMenu items={menus} onClick={handleClick} collapsed={collapsed} switchCollapsed={switchCollapsed} defaultSelectedKeys={defaultSelectedKeys} activeMode='click' />
      )}
    </div>
  );
};

export default SideMenu;
