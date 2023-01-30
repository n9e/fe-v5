import React from 'react';

interface IProps {
  children: React.ReactNode;
  label: React.ReactNode;
  style?: React.CSSProperties;
}

export default function FormItem(props: IProps) {
  return (
    <div
      className='prom-query-builder-formitem'
      style={{
        ...(props.style || {}),
      }}
    >
      <div className='prom-query-builder-formitem-label'>{props.label}</div>
      <div>{props.children}</div>
    </div>
  );
}
