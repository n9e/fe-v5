/**
 * 时间序列图
 */
import React, { useEffect } from 'react';
import { byteConverter } from './utils';

export default function index() {
  useEffect(() => {
    byteConverter.format(10000);
  }, []);
  return <div>111</div>;
}
