import React, { ReactNode } from 'react';
import './index.less';
import { RollbackOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
interface IPageLayoutProps {
  icon?: ReactNode;
  title?: String;
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
  const { t } = useTranslation();
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
            <div className={'page-header-right-area'}>{rightArea}</div>
          </div>
        </div>
      )}
      {children && children}
    </div>
  );
};

export default PageLayout;
