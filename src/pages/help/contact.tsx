import React from 'react';
import { Card, Image } from 'antd';
import Icon from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import SystemInfoSvg from '../../../public/image/system-info.svg';

const { Meta } = Card;

export default function version() {
  return (
    <PageLayout
      title={
        <>
          <Icon component={SystemInfoSvg as any} /> 联系我们
        </>
      }
      hideCluster
    >
      <div style={{ padding: 10 }}>
        <div style={{ padding: 20 }}>
          <ul style={{ paddingLeft: 10 }}>
            <li>
              文档国外地址：
              <a href='https://n9e.github.io/' target='_blank'>
                https://n9e.github.io/
              </a>
            </li>
            <li>
              文档国内地址：
              <a href='https://n9e.gitee.io/' target='_blank'>
                https://n9e.gitee.io/
              </a>
            </li>
          </ul>
          <div style={{ display: 'flex' }}>
            <Card style={{ width: 250, marginRight: 10 }} cover={<Image style={{ border: '1px solid #efefef', height: 305 }} preview={false} src={'/image/wx_n9e.png'} />}>
              <Meta title={<div style={{ textAlign: 'center' }}>微信公众号</div>} />
            </Card>
            <Card style={{ width: 250, marginRight: 10 }} cover={<Image style={{ border: '1px solid #efefef', height: 305 }} preview={false} src={'/image/dingtalk.png'} />}>
              <Meta title={<div style={{ textAlign: 'center' }}>钉钉交流群</div>} />
            </Card>
            <Card style={{ width: 250 }} cover={<Image style={{ border: '1px solid #efefef', height: 305 }} preview={false} src={'/image/zsxq.jpeg'} />}>
              <Meta title={<div style={{ textAlign: 'center' }}>知识星球（论坛）</div>} />
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
