import React, { FC, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { Menu, Button } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  AlertOutlined,
  UserOutlined,
  BankOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import './menu.less';
import { RootState, accountStoreState } from '@/store/accountInterface';
import { Logout } from '@/services/login';
import { useTranslation } from 'react-i18next';
const { SubMenu } = Menu;

const SideMenu: FC = () => {
  const { t, i18n } = useTranslation();
  let { profile } = useSelector<RootState, accountStoreState>(
    (state) => state.account,
  );
  const history = useHistory();
  const location = useLocation(); // console.log(location.pathname);

  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleClick: MenuClickEventHandler = ({ key }) => {
    if (key === 'logout') {
      Logout().then((res) => {
        history.push('/login');
      });
    } // 写两个key as string 感觉有点傻

    if (key === 'changeLanguage') {
      let language = i18n.language == 'en' ? 'zh' : 'en';
      i18n.changeLanguage(language);
      localStorage.setItem('language', language);
    }

    if ((key as string).startsWith('/')) {
      history.push(key as string);
    }
  };

  const hideSideMenu = () =>
    location.pathname === '/login' || location.pathname.startsWith('/chart/');

  return hideSideMenu() ? null : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className={`home ${collapsed ? 'collapse' : ''}`}>
        <div
          className='name'
          onClick={() => history.push('/overview')}
          key='overview'
        >
          <img
            src={collapsed ? '/image/logo.svg' : '/image/logo-l.svg'}
            alt=''
            className='logo'
          />
        </div>
      </div>

      <Menu
        theme='dark'
        inlineCollapsed={collapsed}
        onClick={handleClick}
        mode='inline'
      >
        {/* currently we use the key to navigate */}
        <SubMenu key='1' icon={<LineChartOutlined />} title={t('监控看图')}>
          <Menu.Item key='/metric/explorer'>{t('即时看图')}</Menu.Item>
          {/* <Menu.Item key='/metric/explorer2'>即时看图2</Menu.Item> */}
          <Menu.Item key='/dashboard'>{t('监控大盘')}</Menu.Item>
          <Menu.Item key='/indicator'>{t('指标释义')}</Menu.Item>
        </SubMenu>
        <Menu.Item key='/resource' icon={<DatabaseOutlined />}>
          {t('资源管理')}
        </Menu.Item>
        <SubMenu icon={<SettingOutlined />} title={t('策略配置')}>
          <Menu.Item key='/strategy'>{t('告警策略')}</Menu.Item>
          <Menu.Item key='/shield'>{t('屏蔽策略')}</Menu.Item>
        </SubMenu>
        <SubMenu icon={<AlertOutlined />} title={t('告警历史')}>
          <Menu.Item key='/history-events'>{t('全量告警')}</Menu.Item>
          <Menu.Item key='/event'>{t('告警事件')}</Menu.Item>
        </SubMenu>

        <SubMenu icon={<UserOutlined />} title={t('用户管理')}>
          <Menu.Item key='/manage/user'>{t('用户')}</Menu.Item>
          <Menu.Item key='/manage/group'>{t('团队')}</Menu.Item>
        </SubMenu>
        {/* <Menu.Item className='holder'></Menu.Item> */}
        {/* <Menu.Item key='/manage' icon={<UserOutlined />}>
         用户管理
        </Menu.Item> */}

        {/* <Menu.Item key='/account/profile/info'>
         <span className='avator'>
           <i></i>
           {collapsed ? null : (
             <span>{profile.nickname || profile.username}</span>
           )}
         </span>
        </Menu.Item> */}
        {/* <SubMenu
          title={
            <span className='avator'>
              <img src={profile.portrait} alt='' />
              {collapsed ? null : (
                <span>{profile.nickname || profile.username}</span>
              )}
            </span>
          }
        >
          <Menu.Item key='/account/profile/info'>{t('个人信息')}</Menu.Item>
          <Menu.Item key='changeLanguage'>
            {i18n.language == 'en' ? 'switch to Chinese' : '切换为英文'}
          </Menu.Item>
          <Menu.Item key='logout'>{t('退出')}</Menu.Item>
        </SubMenu> */}
      </Menu>
      <Button type='text' onClick={toggleCollapsed} className='collapseBtn'>
        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
      </Button>
    </div>
  );
};

export default SideMenu;
