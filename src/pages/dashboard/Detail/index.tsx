import React from 'react';
import { DetailReducer } from '../DetailContext';
import Detail from './Detail';

export default function index2() {
  return (
    <DetailReducer>
      <Detail />
    </DetailReducer>
  );
}
