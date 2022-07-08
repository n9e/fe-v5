import React, { useState, useEffect, useRef } from 'react';

interface IProps {
  value?: number;
  height: number;
}

export default function ScrollNum(props: IProps) {
  const { value = 0, height } = props;
  const [oldV, setOldV] = useState<number>(value);
  const [newV, setNewV] = useState<number>();
  const [translateY, setTranslateY] = useState(0);
  const [transitionTime, setTransitionTime] = useState(0.6);
  useEffect(() => {
    if (value !== oldV) {
      setNewV(value);
      setTransitionTime(1);
      setTranslateY(height);
      setTimeout(() => {
        setTransitionTime(0);
        setTranslateY(0);
        setOldV(value);
      }, 1000);
    }
  }, [value]);
  return (
    <div style={{ height, overflow: 'hidden' }}>
      <div style={{ height, transform: `translateY(-${translateY}px`, transition: `all ${transitionTime}s ease-out`, lineHeight: height + 'px' }}>{oldV}</div>
      <div style={{ transform: `translateY(-${translateY}px`, transition: `all ${transitionTime}s ease-out`, lineHeight: height + 'px' }}>{newV}</div>
    </div>
  );
}
