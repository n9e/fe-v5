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
import React from 'react';
import './App.less';
import 'antd/dist/antd.less';
import './global.variable.less';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import HeaderMenu from './components/menu';
import Content from './routers';
import store from '@/store';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import zhCN from 'antd/lib/locale/zh_CN';
import en from 'antd/lib/locale/en_US';
import { useTranslation } from 'react-i18next';
import TaskOutput from '@/pages/taskOutput';
import TaskHostOutput from '@/pages/taskOutput/host';

function App() {
  const { t, i18n } = useTranslation();
  return (
    <div className='App'>
      <ConfigProvider
        locale={i18n.language == 'en' ? en : zhCN}
        // getPopupContainer={(node: HTMLElement) => {
        //   if (node) {
        //     return node.parentNode as HTMLElement;
        //   }
        //   return document.body;
        // }}
        
      >
        <Provider store={store as any}>
          <Router>
            <Switch>
              <Route exact path='/job-task/:busiId/output/:taskId/:outputType' component={TaskOutput} />
              <Route exact path='/job-task/:busiId/output/:taskId/:host/:outputType' component={TaskHostOutput} />
              <>
                <HeaderMenu></HeaderMenu>
                <Content></Content>
              </>
            </Switch>
          </Router>
        </Provider>
      </ConfigProvider>
    </div>
  );
}

export default App;
