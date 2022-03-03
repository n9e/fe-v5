/**
 * 定义了一个简单的 Collapse 组件，目前只用于图表配置页面
 * 为什么重新造这个轮子：
 * 1. antd 的 Collapse 组件 children 里面必须是 Collapse.Panel 否则会出现各种异常
 * 2. 无法默认全部展开，需要设置好要展开的 key
 */

import React from 'react';
import CollapsePanel from './Panel';
import './style.less';

interface IProps {
  children: React.ReactNode;
}

export default function index(props: IProps) {
  return <div className='n9e-collapse'>{props.children}</div>;
}

export const Panel = CollapsePanel;
