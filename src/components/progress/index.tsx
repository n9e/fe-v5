import React, { useState, useEffect } from 'react';

import './index.less';

interface IProgressProps {
  processPercent: string;
  bgColor?: string;
}

const Progress: React.FC<IProgressProps> = ({ processPercent, bgColor }) => {
  const [barColor, setBarColor] = useState<string>('#00C0A2');
  useEffect(() => {
    let color = '';
    switch (bgColor) {
      case 'green':
        color = '#00C0A2';
        break;
      case 'yellow':
        color = '#FFC800';
        break;
      case 'red':
        color = '#FF5656';
        break;
      default:
        color = '#F5F5F7';
        break;
    }
    setBarColor(color);
  }, [bgColor]);

  return (
    <div className='process_wrapper'>
      <div className='process_bar'>
        <span
          className='process_width'
          style={{ width: processPercent, background: barColor || '#F5F5F7' }}
        ></span>
      </div>
      <div className='num_con'>
        <span className='num_l'>0%</span>
        <span className='num_r'>100%</span>
      </div>
    </div>
  );
};

export default Progress;
