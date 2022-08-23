import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import _ from 'lodash';
import { ConfigProvider } from 'antd';
import antdZhCN from 'antd/lib/locale/zh_CN';
import antdEnUS from 'antd/lib/locale/en_US';

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

    function destroy() {
      const unmountResult = ReactDOM.unmountComponentAtNode(div);
      if (unmountResult && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    }

    function render(props: any) {
      ReactDOM.render(
        <ConfigProvider locale={config.language === 'en' ? antdEnUS : antdZhCN}>
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

