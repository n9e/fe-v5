import React, { useState, useImperativeHandle, useEffect } from 'react';
import { Button, Modal, ModalProps, ButtonProps } from 'antd';
import { isPromise } from '@/utils';
import { useTranslation } from 'react-i18next';
export interface IButtonModalProps {
  muteTimePromiseOK?(): void | Promise<unknown>;
  handleOk?(): void | Promise<unknown>;
  onOk?(): void;
  handleCancel?: () => void;
  customizeButton?: React.ReactNode;
  buttonName?: string;
  buttonProps?: ButtonProps;
  modalName?: string;
  modalProps?: ModalProps;
  children: React.ReactNode;
  menuButton?: React.ReactNode;
  isFormValidate?: boolean;
  formMountFn?: Function;
  noModal?: boolean;
  isClose?: boolean;
  setParentClose?: (value) => unknown;
}
type refType = {
  handleCancel(): void;
} | null;

const ButtonModal: React.ForwardRefRenderFunction<refType, IButtonModalProps> =
  function (props, ref) {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    const showModal = (e) => {
      if (props.noModal) {
        return;
      }

      setVisible(true);
    };

    useEffect(() => {
      if (props.isClose !== undefined && props.isClose) {
        setVisible(false);
        props.setParentClose && props.setParentClose(false);
      }
    });

    const handleOk = () => {
      if (props.handleOk) {
        const p = props.handleOk();

        if (isPromise(p)) {
          (p as Promise<boolean>).then((res) => {
            if (res) setVisible(false);
          });
        } else {
          setVisible(false);
        }
      }
    };

    const handleMuteTimeOK = () => {
      if (props.muteTimePromiseOK) {
        const p = props.muteTimePromiseOK();

        if (isPromise(p)) {
          (p as Promise<boolean>).then((res) => {
            if (res) setVisible(false);
          });
        } else {
          setVisible(false);
        }
      }
    };

    const handleCancel = () => {
      setVisible(false);
      props.handleCancel && props.handleCancel();
    };

    const showButton = () => {
      if (props.customizeButton) {
        return <span onClick={showModal}>{props.customizeButton}</span>;
      }

      if (props.menuButton) {
        return (
          <li className='ant-dropdown-menu-item' onClick={showModal}>
            {props.menuButton}
          </li>
        );
      }

      return (
        <Button onClick={showModal} type='primary' {...props.buttonProps}>
          {props.buttonName}
        </Button>
      );
    };

    useImperativeHandle(ref, () => ({
      showModal,
      handleCancel,
    }));
    return (
      <>
        {showButton()}
        <Modal
          destroyOnClose
          maskClosable={false}
          title={props.modalName}
          visible={visible}
          zIndex={1001}
          onOk={props.onOk || handleOk}
          onCancel={handleCancel}
          {...props.modalProps}
          footer={
            props.muteTimePromiseOK
              ? [
                  <Button onClick={handleMuteTimeOK} type='primary' danger>
                    {t('清除')}
                  </Button>,
                  <Button onClick={handleCancel}>{t('取消')}</Button>,
                  <Button type='primary' onClick={handleOk}>
                    {t('确定')}
                  </Button>,
                ]
              : undefined
          }
        >
          {props.children}
        </Modal>
      </>
    );
  };

export default React.forwardRef(ButtonModal);
