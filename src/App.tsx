import React, { useState } from 'react';
import './App.css';
import 'antd/dist/antd.less';
import './global.variable.less';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import HeaderMenu from './components/menu';
import Content from './routers';
import store from '@/store';
import { BrowserRouter as Router } from 'react-router-dom';
import zhCN from 'antd/lib/locale/zh_CN';
import en from 'antd/lib/locale/en_US';
import ErrorComponent from './components/ErrorComponent';
import { useTranslation } from 'react-i18next';

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
      >
        <Provider store={store as any}>
          <Router>
            <ErrorComponent>
              <HeaderMenu></HeaderMenu>
              <Content></Content>
            </ErrorComponent>
          </Router>
        </Provider>
      </ConfigProvider>
    </div>
  );
}

export default App;
