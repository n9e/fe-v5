import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { ConfigProvider } from 'antd';
import antdZhCN from 'antd/lib/locale/zh_CN';
import antdEnUS from 'antd/lib/locale/en_US';

interface LocaleMap {
  [index: string]: any,
}

export interface ModalWrapProps {
  title?: string | React.ReactNode,
  visible: boolean,
  data?: any,
  destroy: () => void,
  onOk: (...args: any[]) => void,
  onCancel: () => void,
}

export default function ModalControlWrap(Component: typeof React.Component) {
  return function ModalControl(config: any) {
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
            <Component {...props} />
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
