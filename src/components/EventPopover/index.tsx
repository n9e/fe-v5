import React, { useState, useEffect, useCallback, ReactNode, useRef, useMemo } from 'react';
import './index.less';

interface IProps {
  eventPopoverVisible: boolean;
  setEventPopoverVisible: (show: boolean) => void;
  eventInfo: {
    d3e: any; // 鼠标点击的信息 event
    domRect: any; // 相对定位到哪个父盒子的信息
  };
  children: ReactNode;
}

const EventPopover = (props: IProps) => {
  const { eventPopoverVisible, setEventPopoverVisible, eventInfo, children } = props;

  const eventPopoverBox = useRef<any>(null);
  const bodyWidth = document.body.getClientRects()[0].width;
  const [coordinate, setCoordinate] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (eventPopoverVisible && eventInfo?.d3e) {
      let x = eventInfo.d3e.clientX - eventInfo.domRect.left;
      // 判断弹窗是否超出body范围, 来确定定位的 left 的距离
      if (bodyWidth < eventInfo.d3e.clientX + 180) {
        x = eventInfo.d3e.clientX - eventInfo.domRect.left - 150;
      }
      setCoordinate({
        x: x,
        y: eventInfo.d3e.clientY - eventInfo.domRect.top,
      });
    }
  }, [eventInfo]);

  const bodyEvent = useCallback(() => {
    setEventPopoverVisible(false);
  }, []);
  useEffect(() => {
    if (eventPopoverVisible) {
      document.body.addEventListener('click', bodyEvent, false);
    } else {
      document.body.removeEventListener('click', bodyEvent, false);
    }
  }, [eventPopoverVisible]);

  return (
    <div
      ref={eventPopoverBox}
      className='event_popover'
      style={{ display: eventPopoverVisible && coordinate.x !== 0 ? '' : 'none', left: coordinate.x, top: coordinate.y }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
};

export default EventPopover;
