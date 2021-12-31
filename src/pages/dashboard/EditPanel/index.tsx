import React, { Component } from 'react';
import { Modal } from 'antd';
import _ from 'lodash';
import ModalHOC, { ModalWrapProps } from './ModalHOC';

const WIDTH = '90%';

function index(props: ModalWrapProps) {
  const { visible } = props;
  return (
    <Modal
      width={WIDTH}
      title={'Settings'}
      visible={visible}
      footer={null}
      onCancel={() => {
        props.destroy();
      }}
      bodyStyle={{
        padding: '10px 24px 24px 24px',
      }}
    >
      <div>content</div>
    </Modal>
  );
}

export default ModalHOC(index);
