import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export interface ModalWrapProps {
  title?: string | React.ReactNode;
  visible: boolean;
  data?: any;
  destroy: () => void;
  onOk: (...args: any[]) => void;
  onCancel: () => void;
}

export default function ModalHOC(Component: any) {
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
      ReactDOM.render(<Component {...props} />, div);
    }

    render({ ...config, visible: true, destroy });

    return {
      destroy,
    };
  };
}
