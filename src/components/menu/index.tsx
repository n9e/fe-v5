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
import React, { FC, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { Menu, Button } from 'antd';
import Icon, { MenuUnfoldOutlined, MenuFoldOutlined, LineChartOutlined, CodeOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import querystring from 'query-string';
import { dynamicPackages, Entry } from '@/utils';
import { getMenuPerm } from '@/services/common';
import { RootState as AccountRootState, accountStoreState } from '@/store/accountInterface';
import TargetsSvg from '../../../public/image/targets.svg';
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
    return _.some(subMenus.children, (menu) => {
      return pathname.indexOf(menu.key) !== -1;
    });
  });
  if (currentSubMenu) {
    return currentSubMenu.key;
  }
};
const defaultSelectedKey = (menus: any, pathname) => {
  let key;
  _.forEach(menus, (subMenus: any) => {
    _.forEach(subMenus.children, (menu: any) => {
      if (pathname.indexOf(menu.key) !== -1) {
        key = menu.key;
      }
    });
  });
  return key;
};

const SideMenu: FC = () => {
  const { t, i18n } = useTranslation();
  const menuList = [
    {
      key: 'targets',
      // icon: <DatabaseOutlined />,
      icon: <Icon component={TargetsSvg as any} />,
      title: t('监控对象'),
      children: [
        {
          key: '/targets',
          title: t('对象列表'),
        },
      ],
    },
    {
      key: 'monitor',
      icon: <LineChartOutlined />,
      title: t('监控看图'),
      children: [
        {
          key: '/metric/explorer',
          title: t('即时查询'),
        },
        {
          key: '/object/explorer',
          title: t('快捷视图'),
        },
        {
          key: '/dashboards',
          title: t('监控大盘'),
        },
      ],
    },
    {
      key: 'alarm',
      // icon: <AlertOutlined />,
      icon: <IconFont type='icon-gaojingguanli-weixuanzhongyangshi' />,
      title: t('告警管理'),
      children: [
        {
          key: '/alert-rules',
          title: t('告警规则'),
        },
        {
          key: '/recording-rules',
          title: t('记录规则'),
        },
        {
          key: '/alert-mutes',
          title: t('屏蔽规则'),
        },
        {
          key: '/alert-subscribes',
          title: t('订阅规则'),
        },
        {
          key: '/alert-cur-events',
          title: t('活跃告警'),
        },
        {
          key: '/alert-his-events',
          title: t('历史告警'),
        },
      ],
    },
    {
      key: 'job',
      icon: <CodeOutlined />,
      title: t('告警自愈'),
      children: [
        {
          key: '/job-tpls',
          title: t('自愈脚本'),
        },
        {
          key: '/job-tasks',
          title: t('执行历史'),
        },
      ],
    },
    {
      key: 'manage',
      // icon: <UserOutlined />,
      icon: <IconFont type='icon-renyuanzuzhi-weixuanzhongyangshi' />,
      title: t('人员组织'),
      children: [
        {
          key: '/users',
          title: t('用户管理'),
        },
        {
          key: '/user-groups',
          title: t('团队管理'),
        },
        {
          key: '/busi-groups',
          title: t('业务组管理'),
        },
      ],
    },
    {
      key: 'help',
      // icon: <Icon component={SystemInfoSvg as any} />,
      icon: <IconFont type='icon-xitongxinxi-weixuanzhongyangshi' />,
      title: t('系统信息'),
      children: [
        {
          key: '/help/version',
          title: t('系统版本'),
        },
        {
          key: '/help/contact',
          title: t('联系我们'),
        },
        {
          key: '/help/migrate',
          title: t('管理员迁移'),
        },
        {
          key: '/help/servers',
          title: t('告警引擎'),
        },
      ],
    },
  ];

  const [menus, setMenus] = useState(menuList);
  const history = useHistory();
  const location = useLocation();
  const { pathname } = location;
  let { profile } = useSelector<AccountRootState, accountStoreState>((state) => state.account);
  const [collapsed, setCollapsed] = useState(localStorage.getItem('menuCollapsed') === '1');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([defaultSelectedKey(menus, pathname)]);
  const [openKeys, setOpenKeys] = useState<string[]>(collapsed ? [] : [getDefaultOpenKey(menus, pathname)]);
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    localStorage.setItem('menuCollapsed', !collapsed ? '1' : '0');
    // TODO: 解决大盘 layout resize 问题
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
  };
  const handleClick: MenuClickEventHandler = ({ key }) => {
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
    if (location.pathname === '/login' || location.pathname.startsWith('/chart/')  || location.pathname.startsWith('/dashboards/share/') || location.pathname === '/callback') {
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
            menu.children = menu.children.filter((item) => dat.includes(item.key));
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
      <div className={`home ${collapsed ? 'collapse' : ''}`}>
        <div className='name' onClick={() => history.push('/metric/explorer')} key='overview'>
          <img src={collapsed ? '/image/logo.svg' : '/image/logo-l(1).svg'} alt='' className='logo' />
        </div>
      </div>

      <Menu
        className='left-menu-container'
        // theme='dark'
        inlineCollapsed={collapsed}
        openKeys={openKeys}
        selectedKeys={selectedKeys}
        onClick={handleClick}
        mode='inline'
        onOpenChange={(openKeys: string[]) => {
          setOpenKeys(openKeys);
        }}
      >
        {_.map(menus, (subMenus) => {
          return (
            subMenus.children.length > 0 && (
              <SubMenu key={subMenus.key} icon={subMenus.icon} title={subMenus.title}>
                {_.map(subMenus.children, (menu) => {
                  return <Menu.Item key={menu.key}>{menu.title}</Menu.Item>;
                })}
              </SubMenu>
            )
          );
        })}
        {lazyMenu.sort((a, b) => b.weight - a.weight).map((item) => item.content)}
      </Menu>
      <Button type='text' onClick={toggleCollapsed} className='collapseBtn'>
        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
      </Button>
    </div>
  );
};

export default SideMenu;
