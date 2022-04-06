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
