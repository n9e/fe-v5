import React from 'react';

interface IProps {
  var?: string;
  children: React.ReactNode | Function;
}

export default function index(props: IProps) {
  if (props.var && import.meta.env[props.var] === 'true') {
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
