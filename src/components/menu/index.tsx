import React, { FC, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { Menu, Button } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, LineChartOutlined, DatabaseOutlined, AlertOutlined, UserOutlined, BankOutlined, SettingOutlined } from '@ant-design/icons';
import './menu.less';
import { RootState, accountStoreState } from '@/store/accountInterface';
import { Logout } from '@/services/login';
import { useTranslation } from 'react-i18next';
const { SubMenu } = Menu;

import { dynamicPackages, Entry } from '@/utils';

const Packages = dynamicPackages();
let lazyMenu = Packages.reduce((result: any, module: Entry) => {
  const menu = module.menu;
  return menu ? (result = result.concat(menu)) : result;
}, []);

const SideMenu: FC = () => {
  const { t, i18n } = useTranslation();
  let { profile } = useSelector<RootState, accountStoreState>((state) => state.account);
  const history = useHistory();
  const location = useLocation(); // console.log(location.pathname);

  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleClick: MenuClickEventHandler = ({ key }) => {
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

  return hideSideMenu() ? null : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className={`home ${collapsed ? 'collapse' : ''}`}>
        <div className='name' onClick={() => history.push('/overview')} key='overview'>
          <img src={collapsed ? '/image/logo.svg' : '/image/logo-l.svg'} alt='' className='logo' />
        </div>
      </div>

      <Menu className='left-menu-container' theme='dark' inlineCollapsed={collapsed} onClick={handleClick} mode='inline'>
        <SubMenu icon={<DatabaseOutlined />} title={t('监控对象')}>
          <Menu.Item key='/targets'>{t('对象列表')}</Menu.Item>
        </SubMenu>
        <SubMenu key='1' icon={<LineChartOutlined />} title={t('监控看图')}>
          <Menu.Item key='/metric/explorer'>{t('即时查询')}</Menu.Item>
          <Menu.Item key='/object/explorer'>{t('对象视角')}</Menu.Item>
          <Menu.Item key='/dashboard'>{t('监控大盘')}</Menu.Item>
        </SubMenu>
        <SubMenu icon={<SettingOutlined />} title={t('告警管理')}>
          <Menu.Item key='/alert-rules'>{t('告警规则')}</Menu.Item>
          <Menu.Item key='/alert-mutes'>{t('屏蔽规则')}</Menu.Item>
          <Menu.Item key='/shield'>{t('订阅规则')}</Menu.Item>
          <Menu.Item key='/event'>{t('活跃告警')}</Menu.Item>
          <Menu.Item key='/history-events'>{t('历史告警')}</Menu.Item>
        </SubMenu>
        <SubMenu icon={<AlertOutlined />} title={t('告警自愈')}>
          <Menu.Item key='/event'>{t('自愈脚本')}</Menu.Item>
          <Menu.Item key='/history-events'>{t('执行历史')}</Menu.Item>
        </SubMenu>

        <SubMenu icon={<UserOutlined />} title={t('人员组织')}>
          <Menu.Item key='/manage/user'>{t('用户管理')}</Menu.Item>
          <Menu.Item key='/manage/group'>{t('团队管理')}</Menu.Item>
          <Menu.Item key='/manage/business'>{t('业务组管理')}</Menu.Item>
        </SubMenu>
        {lazyMenu.sort((a, b) => b.weight - a.weight).map((item) => item.content)}
      </Menu>
      <Button type='text' onClick={toggleCollapsed} className='collapseBtn'>
        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
      </Button>
    </div>
  );
};

export default SideMenu;
