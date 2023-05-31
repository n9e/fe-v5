import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import _ from 'lodash';
import { ConfigProvider } from 'antd';
import zh_CN from 'antd/lib/locale/zh_CN';
import zh_HK from 'antd/lib/locale/zh_HK';
import en_US from 'antd/lib/locale/en_US';

export interface ModalWrapProps {
  visible: boolean;
  destroy: () => void;
  onOk: (...args: any[]) => void;
  onCancel: () => void;
}

export default function ModalHOC<T>(Component: React.FC<T & ModalWrapProps>) {
  return function ModalControl(
    config: T & {
      language?: string;
    },
  ) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const i18nMap = { zh_CN, zh_HK, en_US };
    function destroy() {
      const unmountResult = ReactDOM.unmountComponentAtNode(div);
      if (unmountResult && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    }

    function render(props: any) {
      ReactDOM.render(
        <ConfigProvider locale={config?.language ? i18nMap[config.language] : zh_CN}>
          <Router>
            <Component {...props} />
          </Router>
        </ConfigProvider>,
        div,
      );
    }

    render({ ...config, visible: true, destroy });

    return {
      destroy,
    };
  };
}
