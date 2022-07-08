import React, { FC, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { Menu, Button, Divider } from 'antd';
import Icon, {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  UserOutlined,
  CodeOutlined,
  AlertOutlined,
  ContactsOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import './menu.less';
import IconFont from '@/components/IconFont';
import { useQuery } from '@/utils/useHook';
import { detectMob } from '../../utils';
const { SubMenu } = Menu;
import _ from 'lodash';
import { dynamicPackages, Entry } from '@/utils';
import { getMenuPerm } from '@/services/common';
import { RootState as AccountRootState, accountStoreState } from '@/store/accountInterface';
import { useTranslation } from 'react-i18next';
import SystemInfoSvg from '../../../public/image/system-info.svg';
const Packages = dynamicPackages();
let lazyMenu = Packages.reduce((result: any, module: Entry) => {
  const menu = module.menu;
  return menu ? (result = result.concat(menu)) : result;
}, []);

const SideMenu: FC = () => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const menuList = [
    // {
    //   key: 'targets',
    //   icon: <DatabaseOutlined />,
    //   title: t('监控对象'),
    //   children: [
    //     {
    //       key: '/targets',
    //       title: t('对象列表'),
    //     },
    //   ],
    // },
    // {
    //   key: '/dashboards',
    //   title: t('仪表盘'),
    //   icon: <DashboardOutlined />,
    // },
    {
      key: 'monitor',
      icon: <IconFont type='icon-jiankongkantu-weixuanzhongyangshi' />,
      title: t('指标管理'),
      children: [
        {
          key: '/metric/explorer',
          title: t('即时查询'),
        },
        {
          key: '/object/explorer',
          title: t('快捷视图'),
        },
      ],
    },
    {
      key: 'alarm',
      icon: <IconFont type='icon-gaojingguanli-weixuanzhongyangshi' />,
      title: t('告警管理'),
      children: [
        {
          key: '/alert-rules',
          title: t('告警规则'),
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
      icon: <IconFont type='icon-gaojingziyu-weixuanzhongyangshi' />,
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
  ];
  const [menus, setMenus] = useState(menuList);
  const [permList, setPermList] = useState<string[]>();

  const location = useLocation();
  const query = useQuery();
  const [collapsed, setCollapsed] = useState(localStorage.getItem('menuCollapsed') !== '0');
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    localStorage.setItem('menuCollapsed', !collapsed ? '1' : '0');
  };
  let { profile } = useSelector<AccountRootState, accountStoreState>((state) => state.account);
  useEffect(() => {
    // 触发事件墙的resize事件
    const customEvent = new Event('resize');
    window.dispatchEvent(customEvent);
  }, [collapsed]);

  useEffect(() => {
    if (profile.roles.length > 0) {
      if (profile.roles.indexOf('Admin') === -1) {
        getMenuPerm().then((res) => {
          const { dat } = res;
          setPermList(dat);
          const newMenus = [...menuList];

          setMenus(
            newMenus.filter((menu) => {
              if (menu.children) {
                menu.children = menu.children.filter((item) => dat.includes(item.key));
                return menu.children.length > 0;
              } else {
                return dat.includes(menu.key);
              }
            }),
          );
        });
      } else {
        setMenus(menuList);
      }
    }
  }, [profile.roles]);

  const handleClick: MenuClickEventHandler = ({ key }) => {
    // 写两个key as string 感觉有点傻
    if ((key as string).startsWith('/')) {
      history.push(key as string);
    }
  };

  const hideSideMenu = () => location.pathname === '/login' || query.get('menu') === 'hide' || detectMob();
  return hideSideMenu() ? null : (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: collapsed ? 'center' : 'flex-end', padding: '10px 0 10px 10px' }}>
      <div className={`home ${collapsed ? 'collapse' : ''}`}>
        <div className='name' key='overview'>
          <img src={collapsed ? '/image/logo-s.svg' : '/image/logo-l.svg'} alt='' className='logo' />
        </div>
      </div>
      <Menu className='left-menu-container' inlineCollapsed={collapsed} onClick={handleClick} mode='inline' defaultSelectedKeys={[location.pathname]}>
        {lazyMenu
          .filter((item) => item.weight >= 2)
          .sort((a, b) => b.weight - a.weight)
          .map((item) => item.content)}

        {(!permList || permList.includes('/dashboards')) && (
          <Menu.Item key={'/dashboards'} icon={<IconFont type='icon-yibiaopan-weixuanzhongyangshi' />}>
            仪表盘
          </Menu.Item>
        )}

        {lazyMenu.filter((item) => item.weight === 1).map((item) => item.content)}

        {_.map(menus, (subMenus) => {
          return subMenus.children && subMenus.children.length > 0 ? (
            <>
              {subMenus.key === 'manage' && <div className='menu-item-holder'></div>}
              <SubMenu key={subMenus.key} icon={subMenus.icon} title={subMenus.title}>
                {_.map(subMenus.children, (menu) => {
                  return <Menu.Item key={menu.key}>{menu.title}</Menu.Item>;
                })}
              </SubMenu>
            </>
          ) : (
            <Menu.Item key={subMenus.key} icon={subMenus.icon}>
              {subMenus.title}
            </Menu.Item>
          );
        })}

        {lazyMenu
          .filter((item) => item.weight < 0)
          .sort((a, b) => b.weight - a.weight)
          .map((item) => item.content)}
        <SubMenu key={'help'} icon={<IconFont type='icon-guanyukuaimao-weixuanzhongyangshi' />} title={'关于快猫'}>
          <Menu.Item key={'/help/version'}>{t('系统版本')}</Menu.Item>
          <Menu.Item key={'/help/contact'}>{t('联系我们')}</Menu.Item>
        </SubMenu>
      </Menu>
      <Button type='text' onClick={toggleCollapsed} className='collapseBtn'>
        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
      </Button>
    </div>
  );
};

export default SideMenu;
