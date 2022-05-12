import React from 'react';

interface IProps {
  children: React.ReactNode;
}

export default function index(props: IProps) {
  if (import.meta.env.VITE_IS_ADVANCED === 'true') {
    return <div>{props.children}</div>;
  }
  return null;
}
