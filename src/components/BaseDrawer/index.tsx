import React, { useEffect, useRef, useState } from 'react';
import { Button, Drawer, DrawerProps } from 'antd';
import { IContext, IContextWrapperComponent } from '@/store/common';
import { useTranslation } from 'react-i18next';
export interface IDrawerExtProps<T, R, C> {
  defaultVisible?: boolean;
}
export type IBaseDrawerProps<T, R, C> = IContextWrapperComponent<T, R, C> &
  IDrawerExtProps<T, R, C> &
  DrawerProps;
export function BaseDrawer<T = any, R = any, C = any>({
  payload,
  defaultVisible = false,
  renderContent,
  renderTrigger,
  renderFooter,
  onConfirm,
  onMounted,
  beforeClose,
  ...props
}: IBaseDrawerProps<T, R, C>) {
  const { t } = useTranslation();
  const ref = useRef();
  const [visible, setVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [innerContext, setInnerContext] = useState<C>({} as any);
  useEffect(() => {
    if (!visible) {
      return;
    }

    const disposer = onMounted?.(context);
    return () => {
      disposer?.();
    };
  }, [visible]);

  const open = () => {
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  const customClose = () => {
    if (beforeClose) {
      beforeClose(context).then(() => {
        close();
      });
    } else {
      close();
    }
  };

  const context: IContext<T, R, C> = {
    payload,
    ref,
    open,
    close,
    innerContext,
    setInnerContext,
  };
  const footer = (
    <div
      style={{
        textAlign: 'left',
      }}
    >
      <Button
        style={{
          marginRight: 8,
        }}
        type='primary'
        loading={loading}
        onClick={() => {
          setLoading(true);
          onConfirm(context)
            .then(() => {
              close();
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      >
        {t('保存')}
      </Button>
      <Button onClick={customClose}>{t('取消')}</Button>
    </div>
  );
  return (
    <>
      {renderTrigger(context)}
      <Drawer
        footer={renderFooter ? renderFooter(context) : footer}
        className='App'
        visible={visible}
        onClose={customClose}
        destroyOnClose={true}
        {...props}
      >
        <div>{renderContent(context)}</div>
      </Drawer>
    </>
  );
}
