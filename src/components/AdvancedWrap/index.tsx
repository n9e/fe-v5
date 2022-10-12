import React from 'react';
import _ from 'lodash';

interface IProps {
  var?: string;
  children: React.ReactNode | Function;
}

export default function index(props: IProps) {
  let vars: string[] = [];
  if (props.var) {
    if (props.var.indexOf(',') > -1) {
      vars = props.var.split(',');
    } else {
      vars = [props.var];
    }
    const result = _.some(vars, (item) => {
      return import.meta.env[item] === 'true';
    });
    if (result) {
      if (typeof props.children === 'function') {
        return <div>{props.children(true)}</div>;
      }
      return <div>{props.children}</div>;
    }
  }
  if (typeof props.children === 'function') {
    return <div>{props.children(false)}</div>;
  }
  return null;
}
