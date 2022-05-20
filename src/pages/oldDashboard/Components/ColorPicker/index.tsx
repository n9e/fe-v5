import React, { useState, useRef } from 'react';
import { SketchPicker } from 'react-color';
import { Popover } from 'antd';
import useOnClickOutside from '@/components/useOnClickOutside';
import './style.less';

interface IProps {
  value?: string;
  onChange?: (val: string) => void;
}

export default function index(props: IProps) {
  const { value = '#000', onChange } = props;
  const [visible, setVisible] = useState(false);
  const eleRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(eleRef, () => {
    setVisible(false);
  });

  return (
    <Popover
      trigger='click'
      placement='left'
      visible={visible}
      overlayClassName='color-picker-popover'
      content={
        <div
          ref={eleRef}
          onMouseLeave={() => {
            setVisible(false);
          }}
        >
          <SketchPicker
            color={value}
            onChange={(val) => {
              if (onChange) {
                onChange(val.hex);
              }
            }}
          />
        </div>
      }
    >
      <div
        style={{ background: value, width: 32, height: 32, borderRadius: 2, cursor: 'pointer' }}
        onClick={() => {
          setVisible(!visible);
        }}
      />
    </Popover>
  );
}
