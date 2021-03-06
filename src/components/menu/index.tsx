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
import { useSelector, useDispatch } from 'react-redux';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { RootState as AccountRootState, accountStoreState } from '@/store/accountInterface';
import { Menu, Button } from 'antd';
import Icon, { MenuUnfoldOutlined, MenuFoldOutlined, LineChartOutlined, DatabaseOutlined, UserOutlined, CodeOutlined, AlertOutlined, ContactsOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { getMenuPerm } from '@/services/common';
import { useTranslation } from 'react-i18next';
import { dynamicPackages, Entry } from '@/utils';
import TargetsSvg from '../../../public/image/targets.svg';
import './menu.less';
import IconFont from '../IconFont';

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
      title: t('????????????'),
      children: [
        {
          key: '/targets',
          title: t('????????????'),
        },
      ],
    },
    {
      key: 'monitor',
      icon: <LineChartOutlined />,
      title: t('????????????'),
      children: [
        {
          key: '/metric/explorer',
          title: t('????????????'),
        },
        {
          key: '/object/explorer',
          title: t('????????????'),
        },
        {
          key: '/dashboards',
          title: t('????????????'),
        },
      ],
    },
    {
      key: 'alarm',
      // icon: <AlertOutlined />,
      icon: <IconFont type='icon-gaojingguanli-weixuanzhongyangshi' />,
      title: t('????????????'),
      children: [
        {
          key: '/alert-rules',
          title: t('????????????'),
        },
        {
          key: '/recording-rules',
          title: t('????????????'),
        },
        {
          key: '/alert-mutes',
          title: t('????????????'),
        },
        {
          key: '/alert-subscribes',
          title: t('????????????'),
        },
        {
          key: '/alert-cur-events',
          title: t('????????????'),
        },
        {
          key: '/alert-his-events',
          title: t('????????????'),
        },
      ],
    },
    {
      key: 'job',
      icon: <CodeOutlined />,
      title: t('????????????'),
      children: [
        {
          key: '/job-tpls',
          title: t('????????????'),
        },
        {
          key: '/job-tasks',
          title: t('????????????'),
        },
      ],
    },
    {
      key: 'manage',
      // icon: <UserOutlined />,
      icon: <IconFont type='icon-renyuanzuzhi-weixuanzhongyangshi' />,
      title: t('????????????'),
      children: [
        {
          key: '/users',
          title: t('????????????'),
        },
        {
          key: '/user-groups',
          title: t('????????????'),
        },
        {
          key: '/busi-groups',
          title: t('???????????????'),
        },
      ],
    },
    {
      key: 'help',
      // icon: <Icon component={SystemInfoSvg as any} />,
      icon: <IconFont type='icon-xitongxinxi-weixuanzhongyangshi' />,
      title: t('????????????'),
      children: [
        {
          key: '/help/version',
          title: t('????????????'),
        },
        {
          key: '/help/contact',
          title: t('????????????'),
        },
        {
          key: '/help/migrate',
          title: t('???????????????'),
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
  };
  const handleClick: MenuClickEventHandler = ({ key }) => {
    if (location.pathname === key) return;
    setSelectedKeys([key as string]);
    // ?????????key as string ???????????????
    if (key === 'changeLanguage') {
      let language = i18n.language == 'en' ? 'zh' : 'en';
      i18n.changeLanguage(language);
      localStorage.setItem('language', language);
    }

    if ((key as string).startsWith('/')) {
      history.push(key as string);
    }
  };
  const hideSideMenu = () => location.pathname === '/login' || location.pathname.startsWith('/chart/') || location.pathname === '/callback';

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
