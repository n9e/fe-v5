import React, { FC, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { Menu, Button } from 'antd';
import Icon, { MenuUnfoldOutlined, MenuFoldOutlined, LineChartOutlined, DatabaseOutlined, UserOutlined, CodeOutlined, SettingOutlined, ContactsOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { dynamicPackages, Entry } from '@/utils';
import SystemInfoSvg from '../../../public/image/system-info.svg';
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
  const menus = [
    {
      key: 'targets',
      icon: <DatabaseOutlined />,
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
          title: t('对象视角'),
        },
        {
          key: '/dashboard',
          title: t('监控大盘'),
        },
      ],
    },
    {
      key: 'alarm',
      icon: <SettingOutlined />,
      title: t('告警管理'),
      children: [
        {
          key: '/alert-rules',
          title: t('告警规则'),
        },
        {
          key: '/shield',
          title: t('屏蔽规则'),
        },
        {
          key: '/shield-1',
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
      icon: <UserOutlined />,
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
      icon: <Icon component={SystemInfoSvg as any} />,
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
      ],
    },
  ];
  const history = useHistory();
  const location = useLocation();
  const { pathname } = location;
  const [collapsed, setCollapsed] = useState(localStorage.getItem('menuCollapsed') === '1');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([defaultSelectedKey(menus, pathname)]);
  const [openKeys, setOpenKeys] = useState<string[]>(collapsed ? [] : [getDefaultOpenKey(menus, pathname)]);
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    localStorage.setItem('menuCollapsed', !collapsed ? '1' : '0');
  };
  const handleClick: MenuClickEventHandler = ({ key }) => {
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
  const hideSideMenu = () => location.pathname === '/login' || location.pathname.startsWith('/chart/');

  useEffect(() => {
    setSelectedKeys([defaultSelectedKey(menus, pathname)]);
    if (!collapsed) {
      setOpenKeys(_.union([...openKeys, getDefaultOpenKey(menus, pathname)]));
    }
  }, [pathname, collapsed]);

  return hideSideMenu() ? null : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className={`home ${collapsed ? 'collapse' : ''}`}>
        <div className='name' onClick={() => history.push('/metric/explorer')} key='overview'>
          <img src={collapsed ? '/image/logo.svg' : '/image/logo-l.svg'} alt='' className='logo' />
        </div>
      </div>

      <Menu
        className='left-menu-container'
        theme='dark'
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
            <SubMenu key={subMenus.key} icon={subMenus.icon} title={subMenus.title}>
              {_.map(subMenus.children, (menu) => {
                return <Menu.Item key={menu.key}>{menu.title}</Menu.Item>;
              })}
            </SubMenu>
          );
        })}
        {/* <SubMenu key='/targets' icon={<DatabaseOutlined />} title={t('监控对象')}>
          <Menu.Item key='/targets'>{t('对象列表')}</Menu.Item>
        </SubMenu>
        <SubMenu key='/metric,/object,/dashboard' icon={<LineChartOutlined />} title={t('监控看图')}>
          <Menu.Item key='/metric/explorer'>{t('即时查询')}</Menu.Item>
          <Menu.Item key='/object/explorer'>{t('对象视角')}</Menu.Item>
          <Menu.Item key='/dashboard'>{t('监控大盘')}</Menu.Item>
        </SubMenu>
        <SubMenu key='/alert-rules,/shield,/event,/history-events' icon={<SettingOutlined />} title={t('告警管理')}>
          <Menu.Item key='/alert-rules'>{t('告警规则')}</Menu.Item>
          <Menu.Item key='/shield'>{t('屏蔽规则')}</Menu.Item>
          <Menu.Item key='/shield'>{t('订阅规则')}</Menu.Item>
          <Menu.Item key='/event'>{t('活跃告警')}</Menu.Item>
          <Menu.Item key='/history-events'>{t('历史告警')}</Menu.Item>
        </SubMenu>
        <SubMenu key='/job-tpls,/job-tasks' icon={<CodeOutlined />} title={t('告警自愈')}>
          <Menu.Item key='/job-tpls'>{t('自愈脚本')}</Menu.Item>
          <Menu.Item key='/job-tasks'>{t('执行历史')}</Menu.Item>
        </SubMenu>
        <SubMenu key='/manage' icon={<UserOutlined />} title={t('人员组织')}>
          <Menu.Item key='/manage/user'>{t('用户管理')}</Menu.Item>
          <Menu.Item key='/manage/group'>{t('团队管理')}</Menu.Item>
          <Menu.Item key='/manage/business'>{t('业务组管理')}</Menu.Item>
        </SubMenu> */}
        {lazyMenu.sort((a, b) => b.weight - a.weight).map((item) => item.content)}
      </Menu>
      <Button type='text' onClick={toggleCollapsed} className='collapseBtn'>
        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
      </Button>
    </div>
  );
};

export default SideMenu;
