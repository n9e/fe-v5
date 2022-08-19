import React from 'react';

interface IProps {
  children: React.ReactNode | Function;
}

export const isAdvanced = import.meta.env.VITE_IS_ADVANCED === 'true';
export const isEnhanced = import.meta.env.VITE_IS_ENHANCED === 'true';

export default function index(props: IProps) {
  if (isAdvanced || isEnhanced) {
    if (typeof props.children === 'function') {
      return <div>{props.children(true)}</div>;
    }
    return <div>{props.children}</div>;
  }
  if (typeof props.children === 'function') {
    return <div>{props.children(false)}</div>;
  }
  return null;
}
