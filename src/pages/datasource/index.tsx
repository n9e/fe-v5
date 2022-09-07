import React from 'react';
import { Link } from 'react-router-dom';
import { AppstoreOutlined, ReloadOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import './index.less';
import IconFont from '@/components/IconFont';

export default function index() {
  return (
    <PageLayout>
      <div className='settings-container srm'>
        <Link to={{ pathname: '/settings/source/timeseries' }}>
          <div className='settings-source-selector' style={{ marginRight: 80 }}>
            <IconFont type='icon-datasource' />
            <div>数据源管理</div>
          </div>
        </Link>
        <div className='settings-source-selector'>
          <IconFont type='icon-relations' />
          <div>关联关系</div>
        </div>
      </div>
    </PageLayout>
  );
}
