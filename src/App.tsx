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
import ErrorComponent from './components/ErrorComponent';
import { useTranslation } from 'react-i18next';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TaskOutput from '@/pages/taskOutput';
import TaskHostOutput from '@/pages/taskOutput/host';

function App() {
  const { t, i18n } = useTranslation();
  return (
    <div className='App'>
      <ConfigProvider
        locale={i18n.language == 'en' ? en : zhCN}
        getPopupContainer={(node: HTMLElement) => {
          if (node) {
            return node.parentNode as HTMLElement;
          }
          return document.body;
        }}
        renderEmpty={() => (
          <div style={{ padding: 20 }}>
            <img src='/image/empty.png' width='64' />
            <div className='ant-empty-description'>{t('暂无数据')}</div>
          </div>
        )}
      >
        <Provider store={store as any}>
          <Router>
            <ErrorComponent>
              <Switch>
                <Route exact path='/job-task/:busiId/output/:taskId/:outputType' component={TaskOutput} />
                <Route exact path='/job-task/:busiId/output/:taskId/:host/:outputType' component={TaskHostOutput} />
                <>
                  <HeaderMenu></HeaderMenu>
                  <DndProvider backend={HTML5Backend}>
                    <Content></Content>
                  </DndProvider>
                </>
              </Switch>
            </ErrorComponent>
          </Router>
        </Provider>
      </ConfigProvider>
    </div>
  );
}

export default App;
