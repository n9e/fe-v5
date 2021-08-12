import React from 'react';
import { Spin } from 'antd';

const loadComp = (Com: React.LazyExoticComponent<any>) => {
  return class LoadComp extends React.Component<any, any> {
    render() {
      return (
        <React.Suspense
          fallback={
            <div
              style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Spin />
            </div>
          }
        >
          <Com />
        </React.Suspense>
      );
    }
  };
};

export default loadComp;
