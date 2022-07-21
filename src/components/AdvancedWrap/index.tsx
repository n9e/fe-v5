import React from 'react';

interface IProps {
  children: React.ReactNode | Function;
}

export default function index(props: IProps) {
  if (import.meta.env.VITE_IS_ADVANCED === 'true' || import.meta.env.VITE_IS_ENHANCED === 'true') {
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
