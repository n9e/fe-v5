/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
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
