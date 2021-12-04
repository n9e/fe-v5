import React, { useState, ReactNode } from 'react';
import './index.less';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RollbackOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { RootState as AccountRootState, accountStoreState } from '@/store/accountInterface';
import { RootState as CommonRootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
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
  hideCluster?: Boolean;
  onChangeCluster?: (string) => void;
}

const PageLayout: React.FC<IPageLayoutProps> = ({ icon, title, rightArea, children, customArea, showBack, onChangeCluster, hideCluster = false }) => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  let { profile } = useSelector<AccountRootState, accountStoreState>((state) => state.account);
  const { clusters } = useSelector<CommonRootState, CommonStoreState>((state) => state.common);
  const localCluster = localStorage.getItem('curCluster');
  const [curCluster, setCurCluster] = useState<string>(localCluster || clusters[0]);
  if (!localCluster && clusters.length > 0) {
    setCurCluster(clusters[0]);
    localStorage.setItem('curCluster', clusters[0]);
  }

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
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            dispatch({
              type: 'common/saveData',
              prop: 'clusters',
              data: [],
            });
            dispatch({
              type: 'common/saveData',
              prop: 'busiGroups',
              data: [],
            });
            history.push('/login');
          });
        }}
      >
        {t('退出')}
      </Menu.Item>
    </Menu>
  );

  const clusterMenu = (
    <Menu selectedKeys={[curCluster]}>
      {clusters.map((cluster) => (
        <Menu.Item
          key={cluster}
          onClick={(_) => {
            setCurCluster(cluster);
            onChangeCluster && onChangeCluster(cluster);
            localStorage.setItem('curCluster', cluster);
          }}
        >
          {cluster}
        </Menu.Item>
      ))}
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
                  onClick={() => history.goBack()}
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
              {!hideCluster && (
                <div style={{ marginRight: 20 }}>
                  <Dropdown overlay={clusterMenu}>
                    <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                      {curCluster} <DownOutlined />
                    </a>
                  </Dropdown>
                </div>
              )}
              {/* 文案完善了再打开 */}
              {/* <span
                className='language'
                onClick={() => {
                  let language = i18n.language == 'en' ? 'zh' : 'en';
                  i18n.changeLanguage(language);
                  localStorage.setItem('language', language);
                }}
              >
                {i18n.language == 'zh' ? 'En' : '中'}
              </span> */}
              <Dropdown overlay={menu} trigger={['click']}>
                <span className='avator'>
                  <img src={profile.portrait || '/image/avatar1.png'} alt='' />
                  <span className='display-name'>{profile.nickname || profile.username}</span>
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
