import React, { useEffect, useState } from 'react';
import { Input, Col, Row } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
export type KV = {
  key: string;
  value: string;
};
export interface IKeyValueInputProps {
  value?: string;
  onChange?: (value: string | object) => unknown;
  /**
   * @desc 是否按照keyValue结构现实 ep: key=value , 或者是普通 {"aa": "bb"}对象形式
   */

  isKeyValue?: boolean;
  placeText: string;
}

const KeyValueInput: React.FC<IKeyValueInputProps> = ({
  value,
  onChange,
  isKeyValue = true,
  placeText,
  ...props
}) => {
  const { t } = useTranslation();
  const [showValues, setShowValues] = useState<Array<KV>>([]);
  const [emptyLine, setEmptyLine] = useState<boolean>(false); // 因为onChange触发后会重绘，而空对象时会顺带把空行删除，所以采取此workaround
  const tagKey = `${placeText}${t('名')}`;
  const tagVal = `${placeText}${t('值')}`;

  useEffect(() => {
    let values: Array<KV> = [];

    if (isKeyValue) {
      values = value
        ?.split(' ')
        .filter((item) => {
          if (item.indexOf('=') === -1) {
            return false;
          } else {
            const [key, value] = item.split('=');

            if (key && value) {
              return true;
            } else {
              return false;
            }
          }
        })
        .map((valueItem) => {
          const [key, value] = valueItem.split('=');
          return {
            key,
            value,
          };
        }) || [
        {
          key: '',
          value: '',
        },
      ];
    } else if (!isKeyValue && value) {
      try {
        Object.keys(value).forEach((keyItem) => {
          values.push({
            key: keyItem,
            value: value[keyItem],
          });
        });
        if (emptyLine) {
          values.push({
            key: '',
            value: '',
          });
        }
        setEmptyLine(false);
      } catch (error) {}
    }

    setShowValues(values);
  }, [value]);

  const changeKey = (e, index) => {
    showValues[index].key = e.target.value;
    setShowValues([...showValues]);

    if (isKeyValue) {
      currentOnChange();
    } else {
      const { key, value } = showValues[index];

      if (key && value) {
        currentOnChange();
      }
    }
  };

  const changeValue = (e, index) => {
    showValues[index].value = e.target.value;
    setShowValues([...showValues]);

    if (isKeyValue) {
      currentOnChange();
    } else {
      const { key, value } = showValues[index];

      if (key && value) {
        currentOnChange();
      }
    }
  };

  const currentOnChange = () => {
    if (onChange) {
      if (isKeyValue) {
        let finalString = '';
        showValues.forEach((valueItem) => {
          const { key, value } = valueItem;

          if (key && value) {
            finalString += `${key}=${value} `;
          }
        });
        onChange(finalString);
      } else {
        const newObject = {};
        showValues.forEach((valueItem) => {
          const { key, value } = valueItem;

          if (key) {
            newObject[key] = value;
          }
          // else {
          //   newObject['key'] = value;
          // }
          if (showValues.length > 0 && !key && !value) {
            setEmptyLine(true);
          }
        });
        onChange(newObject);
      }
    }
  };

  const remove = (index) => {
    showValues.splice(index, 1);
    setShowValues([...showValues]);
  };

  const add = () => {
    showValues.push({
      key: '',
      value: '',
    });
    setShowValues([...showValues]);
  };

  return (
    <>
      {showValues.length > 0 ? (
        showValues.map((valueItem, index) => {
          return (
            <Row key={index}>
              <Col>
                <Input
                  addonBefore={tagKey}
                  value={valueItem.key}
                  placeholder={
                    isKeyValue
                      ? 'tagKey'
                      : `${t('请输入')}${placeText}${t('名')}`
                  }
                  style={{
                    width: 180,
                  }}
                  onChange={(e) => changeKey(e, index)}
                ></Input>
              </Col>
              {isKeyValue ? (
                <Col span={2}>
                  <span
                    style={{
                      textAlign: 'center',
                      width: '100%',
                      display: 'inline-block',
                      height: 32,
                      lineHeight: '32px',
                    }}
                  >
                    =
                  </span>
                </Col>
              ) : null}
              <Col offset={isKeyValue ? 0 : 2}>
                <Input
                  addonBefore={tagVal}
                  value={valueItem.value}
                  placeholder={
                    isKeyValue
                      ? 'tagValue'
                      : `${t('请输入')}${placeText}${t('值')}`
                  }
                  style={{
                    width: 180,
                  }}
                  width={200}
                  onChange={(e) => changeValue(e, index)}
                ></Input>
              </Col>
              <Col
                offset={1}
                style={{
                  marginBottom: index === showValues.length - 1 ? 0 : 24,
                  lineHeight: '32px',
                }}
              >
                {index === showValues.length - 1 &&
                valueItem.value &&
                valueItem.key ? (
                  <>
                    <MinusCircleOutlined
                      style={{
                        marginRight: '8px',
                      }}
                      onClick={() => {
                        remove(index);
                        currentOnChange();
                      }}
                    />
                    <PlusCircleOutlined onClick={() => add()} />
                  </>
                ) : (
                  <MinusCircleOutlined
                    onClick={() => {
                      remove(index);
                      currentOnChange();
                    }}
                  />
                )}
              </Col>
            </Row>
          );
        })
      ) : (
        <PlusCircleOutlined onClick={() => add()} />
      )}
    </>
  );
};

export default KeyValueInput;
