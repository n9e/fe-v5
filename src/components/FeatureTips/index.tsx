import React, { ReactNode, useState, useEffect, useLayoutEffect, isValidElement, useRef } from 'react';
import { Tooltip } from 'antd';
import './index.less';
import classNames from 'classnames';
interface Props {
  id: string | number | symbol;
  children: ReactNode;
  enable: boolean;
  introduction: string;
}

export default function FeatureTips(props: Props) {
  const contentRef = useRef<any>(null);
  const { children, enable, introduction, id } = props;
  const [available, setAvailable] = useState(enable && !localStorage.getItem(`tips-${String(id)}`));
  const [position, setPosition] = useState<{ x: number; y: number; width: number }>();

  useLayoutEffect(() => {
    setTimeout(() => {
      const { x, y, width } = contentRef.current.getBoundingClientRect();
      setPosition({ x, y, width });
    }, 1000);
  }, []);

  const handleClick = () => {
    setAvailable(false);
    localStorage.setItem(`tips-${String(id)}`, '1');
  };

  return (
    <div className='feature-tips' ref={contentRef}>
      {children}
      {position && (
        <Tooltip title={introduction} getPopupContainer={() => document.body} placement='bottom' trigger={'click'}>
          <img
            onClick={handleClick}
            src='/image/intro-tips.svg'
            className={classNames({ 'tip-icon': true, debounce: available })}
            // style={{ left: position ? position.x + position.width / 2 + 'px' : undefined, top: position ? position.y - 32 + 'px' : undefined }}
          />
        </Tooltip>
      )}
    </div>
  );
}
