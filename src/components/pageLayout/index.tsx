import React, { ReactNode } from 'react';
import './index.less';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RollbackOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { RootState, accountStoreState } from '@/store/accountInterface';
import { Menu, Dropdown, Switch } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Logout } from '@/services/login';
interface IPageLayoutProps {
  icon?: ReactNode;
  title?: String | JSX.Element;
  children?: ReactNode;
  rightArea?: ReactNode;
  customArea?: ReactNode;
  showBack?: Boolean;
}

const PageLayout: React.FC<IPageLayoutProps> = ({
  icon,
  title,
  rightArea,
  children,
  customArea,
  showBack,
}) => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  let { profile } = useSelector<RootState, accountStoreState>(
    (state) => state.account,
  );

  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => {
          history.push('/account/profile/info');
        }}
      >
        {t('个人信息')}
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          Logout().then((res) => {
            history.push('/login');
          });
        }}
      >
        {t('退出')}
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={'page-wrapper'}>
      {customArea ? (
        <div className={'page-top-header'}>{customArea}</div>
      ) : (
        <div className={'page-top-header'}>
          <div className={'page-header-content'}>
            <div className={'page-header-title'}>
              {showBack && (
                <RollbackOutlined
                  onClick={() => window.history.back()}
                  style={{
                    marginRight: '5px',
                  }}
                />
              )}
              {icon}
              {title}
            </div>
            {/* <div className={'page-header-right-area'}>{rightArea}</div> */}
            <div className={'page-header-right-area'}>
              <span
                className='language'
                onClick={() => {
                  let language = i18n.language == 'en' ? 'zh' : 'en';
                  i18n.changeLanguage(language);
                  localStorage.setItem('language', language);
                }}
              >
                {i18n.language == 'zh' ? 'En' : '中'}
              </span>
              <Dropdown overlay={menu} trigger={['click']}>
                <span className='avator'>
                  <img src={profile.portrait || '/image/avatar1.png'} alt='' />
                  <span className='display-name'>
                    {profile.nickname || profile.username}
                  </span>
                  <DownOutlined />
                </span>
              </Dropdown>
            </div>
          </div>
        </div>
      )}
      {children && children}
    </div>
  );
};

export default PageLayout;
