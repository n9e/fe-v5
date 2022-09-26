import React from 'react';
import { Button, Drawer } from 'antd';
import { Link } from 'react-router-dom';
import { DataSourceType } from '../types';
import './index.less';
interface Props {
  data: DataSourceType;
  visible: boolean;
  onClose: () => void;
  editUrl?: string;
  renderContent: (data: DataSourceType) => React.ReactNode;
}
export default function Index(props: Props) {
  const { data, visible, onClose, editUrl = '/settings/logsource/edit', renderContent } = props;

  return (
    <Drawer
      width={584}
      closeIcon={false}
      className='settings-data-source-detail-drawer'
      bodyStyle={{
        padding: '0 15px 15px',
        background: '#fff',
      }}
      title=''
      placement='right'
      onClose={onClose}
      visible={visible}
      footer={
        <Button style={{ float: 'right' }}>
          {/* <Link to={`${editUrl}/${data.plugin_type.split('.')[0]}/${data.id}`}>编辑</Link> */}
          <Link to={`${editUrl}/${data.plugin_type}/${data.id}`}>编辑</Link>
        </Button>
      }
    >
      <div>
        <div className='page-title'>数据源名称</div>
        <div>{data.name}</div>
        {renderContent(data)}
        {data.description && (
          <>
            <div className='page-title'>备注</div>
            <div className='flash-cat-block'>{data.description}</div>
          </>
        )}
      </div>
    </Drawer>
  );
}
