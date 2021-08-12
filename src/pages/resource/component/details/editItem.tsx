import React, { useEffect, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Button, Input, message, Select, Tag } from 'antd';
import { OptionProps, SelectProps } from 'antd/lib/select';
import { select } from 'redux-saga/effects';
import './index.less';
import { useTranslation } from 'react-i18next';
interface IEditItemProps {
  value: any;
  editType: 'input' | 'select';
  selectProps?: SelectProps<any>;
  validator?: Function;
  onChange?: (value: any) => unknown;
}

const EditItem: React.FC<IEditItemProps> = ({
  value,
  editType,
  selectProps,
  validator,
  onChange,
}) => {
  const { t } = useTranslation();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [originValue, setOriginValue] = useState<any>(value);
  const [showValue, setShowValue] = useState<any>(value);
  useEffect(() => {
    setOriginValue(value);
    setShowValue(value);
  }, [value]);

  const handleOnChange = (value) => {
    let result: boolean = true;

    if (validator) {
      result = validator(value) || false;

      if (!result) {
        message.error(`"${value}${t('"不符合输入规范（格式为key=value）')}`);
        return;
      }
    }

    setShowValue(value);
  };

  const handleCancel = () => {
    setShowValue(originValue);
    setIsEdit(false);
  };

  const handleConfirm = () => {
    setIsEdit(false);
    onChange && onChange(showValue);
    setOriginValue(showValue);
  };

  const renderCommon = () => {
    let selectShowString: any; // let selectShowDom: any;

    if (Array.isArray(showValue) && editType === 'select') {
      if (selectProps?.options) {
        selectShowString = selectProps?.options
          .filter((option) => {
            return showValue.includes(option.value);
          })
          .map((option, index) => (
            <Tag key={index} color='blue'>
              {option.label}
            </Tag>
          )); // .join(',');
      } else {
        // selectShowString = showValue.join(',');
        selectShowString = showValue.map((item) => (
          <Tag key={item} color='blue'>
            {item}
          </Tag>
        ));
      }
    }

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
        className={'hoverInput'}
      >
        <div
          style={{
            minHeight: 32,
            marginRight: 10,
          }}
        >
          {editType === 'select' ? selectShowString : showValue}
        </div>
        <EditOutlined
          onClick={() => {
            setIsEdit(true);
          }}
        ></EditOutlined>
      </div>
    );
  };

  const renderEdit = () => {
    console.log(showValue);
    return (
      <>
        {editType === 'input' ? (
          <Input
            value={showValue}
            onChange={(e) => {
              handleOnChange(e.target.value);
            }}
          ></Input>
        ) : (
          <Select
            onChange={handleOnChange}
            value={showValue}
            {...selectProps}
          ></Select>
        )}
        <Button
          style={{
            margin: '0 8px',
          }}
          size='small'
          onClick={handleCancel}
        >
          {t('取消')}
        </Button>
        <Button size='small' type='primary' onClick={handleConfirm}>
          {t('保存')}
        </Button>
      </>
    );
  };

  return <>{!isEdit ? renderCommon() : renderEdit()}</>;
};

export default EditItem;
