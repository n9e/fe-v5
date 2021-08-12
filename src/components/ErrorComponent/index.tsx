import React from 'react';
import { useTranslation } from 'react-i18next';

class ErrorComponent extends React.Component<
  any,
  {
    hasError: boolean;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error) {
    console.log(error, 'error');
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
      return null;
    } //正常则返回子元素，即该组件包裹的元素

    return this.props.children;
  }
}

export default ErrorComponent;
