import { Button, Result } from 'antd';
import React from 'react';
import { useHistory } from 'react-router';

const NotFound: React.FC = () => {
  const history = useHistory();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Result
        title='404'
        subTitle='你访问的页面不存在!'
        extra={
          <Button type='primary' onClick={() => history.replace('/')}>
            回到首页
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
