import React, { useEffect, useState } from 'react';
import Icon from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import SystemInfoSvg from '../../../public/image/system-info.svg';
import pkgJson from '../../../package.json';

export default function version() {
  const [backendVersion, setBackendVersion] = useState('');

  useEffect(() => {
    fetch('/api/n9e/version')
      .then((res) => {
        return res.text();
      })
      .then((res) => {
        setBackendVersion(res);
      });
  }, []);

  return (
    <PageLayout
      title={
        <>
          <Icon component={SystemInfoSvg as any} /> 系统版本
        </>
      }
    >
      <div style={{ padding: 10 }}>
        <ul style={{ padding: '20px 30px' }}>
          <li>前端版本：{pkgJson.version}</li>
          <li>后端版本：{backendVersion}</li>
        </ul>
      </div>
    </PageLayout>
  );
}
