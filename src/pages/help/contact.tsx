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
import React, { useEffect, useState } from 'react';
import { Card, Image } from 'antd';
import Icon, { GithubOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import SystemInfoSvg from '../../../public/image/system-info.svg';
// import GitHubButton from 'react-github-btn';
const { Meta } = Card;
import './index.less';
export default function version() {
  const [backendNum, setbackendNum] = useState(4701);
  const [frontendNum, setfrontendNum] = useState(95);
  useEffect(() => {
    fetch('https://api.github.com/repos/ccfos/nightingale').then((res) => {
      res.json().then((r) => {
        setbackendNum(r.stargazers_count);
      });
    });
    fetch('https://api.github.com/repos/n9e/fe-v5').then((res) => {
      res.json().then((r) => {
        setfrontendNum(r.stargazers_count);
      });
    });
  }, []);
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
          <ul style={{ paddingLeft: 10, marginBottom: 10 }}>
            <li style={{ display: 'flex', height: 20 }}>
              文档地址：
              <a href='https://n9e.github.io/' target='_blank'>
                https://n9e.github.io/
              </a>
            </li>
          </ul>
          <div style={{ paddingLeft: 10, marginBottom: 16 }}>
            欢迎大家在github上关注夜莺项目，及时获取项目更新动态，有任何问题，也欢迎提交 issue，当然，如果能直接 PR 就更好了，开源软件，就是需要大家一起参与才能有蓬勃的生命力。
          </div>
          <ul style={{ paddingLeft: 10 }}>
            <li style={{ display: 'flex', height: 20, marginBottom: 10 }}>
              后端代码仓库：
              <a href='https://github.com/ccfos/nightingale' target='_blank' style={{ marginRight: 8 }}>
                https://github.com/ccfos/nightingale
              </a>
              {/* <GitHubButton
                href='https://github.com/ccfos/nightingale'
                data-color-scheme='no-preference: dark; light: light; dark: dark;'
                data-show-count='true'
                aria-label='Star ccfos/nightingale on GitHub'
              >
                Star
              </GitHubButton> */}
              <span className='github-widget'>
                <a className='github-icon' href='https://github.com/ccfos/nightingale' target='_blank'>
                  <GithubOutlined /> Star
                </a>
                <a className='github-star' href='https://github.com/ccfos/nightingale/stargazers' target='_blank'>
                  {backendNum}
                </a>
              </span>
            </li>
            <li style={{ display: 'flex', height: 20, marginBottom: 10 }}>
              后端代码仓库：
              <a href='https://www.gitlink.org.cn/ccfos/nightingale' target='_blank' style={{ marginRight: 8 }}>
                https://www.gitlink.org.cn/ccfos/nightingale
              </a>
            </li>
            <li style={{ display: 'flex', height: 20, marginBottom: 10 }}>
              前端代码仓库：
              <a href='https://github.com/n9e/fe-v5' target='_blank' style={{ marginRight: 8 }}>
                https://github.com/n9e/fe-v5
              </a>
              {/* <GitHubButton
                href='https://github.com/n9e/fe-v5'
                data-color-scheme='no-preference: dark; light: light; dark: dark;'
                data-show-count='true'
                aria-label='Star n9e/fe-v5 on GitHub'
              >
                Star
              </GitHubButton> */}
              <span className='github-widget'>
                <a className='github-icon' href='https://github.com/n9e/fe-v5' target='_blank'>
                  <GithubOutlined /> Star
                </a>
                <a className='github-star' href='https://github.com/n9e/fe-v5/stargazers' target='_blank'>
                  {frontendNum}
                </a>
              </span>
            </li>
          </ul>
          <Image style={{ border: '1px solid #efefef', height: 250 }} preview={false} src={import.meta.env.VITE_PREFIX + '/image/wx_n9e.jpg'} />
        </div>
      </div>
    </PageLayout>
  );
}
