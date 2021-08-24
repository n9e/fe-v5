import React, { useContext, useEffect, useState } from 'react';
import { Row, Col, Input, Select, Checkbox } from 'antd';
import { getResourceGroups, getTagKey, getTagValue } from '@/services';
import { PAGE_SIZE_OPTION_LARGE } from '@/utils/constant';
import { DeleteOutlined } from '@ant-design/icons';
import { resourceGroupItem } from '@/store/businessInterface';
import { TagDataItem } from './definition';
import { useTranslation } from 'react-i18next';
import MetricTable, { Metric } from '@/pages/metric/matric';
import { debounce } from 'lodash';
import {
  DEFAULT_CLASSPATH_DATA,
  DELETE_ITEM,
  TagFilterStore,
  UPDATE_ITEM,
} from './constant';
const { Option } = Select;
interface ITagItemProps {
  tagData: TagDataItem;
  index: string;
  isEditing: boolean;
}

const TagItem: React.FC<ITagItemProps> = ({ tagData, index, isEditing }) => {
  const { t } = useTranslation();
  const NAME_NON_EXISTENT = t('必须要有一个变量名');
  const NAME_DUPLICATE = t('变量名重复');
  const NAME_INVALID = t('变量名包含非法字符');
  const NAME_REQUIRE = t('key, value必填');
  const KEY_UNIQUE = t('key重复');
  const DEFAULT_VALUE = '*';
  const CLASS_PATH = 'classpath';
  const CLASS_PATH_VALUE = 'classpath';
  const CLASS_PATH_PREFIX = 'classpath(prefix)';
  const CLASS_PATH_PREFIX_VALUE = 'classpath_prefix';
  const [data, dispatch] = useContext(TagFilterStore);
  const [tagKeyOptions, setTagKeyOptions] = useState<string[]>([
    CLASS_PATH_VALUE,
  ]);
  const [valueOptions, setValueOptions] = useState<
    string[] | resourceGroupItem[]
  >(() => {
    if (
      tagData.key === CLASS_PATH_VALUE ||
      tagData.key === CLASS_PATH_PREFIX_VALUE
    ) {
      return [DEFAULT_CLASSPATH_DATA];
    } else {
      return [DEFAULT_VALUE];
    }
  });
  const [tagKeyLoading, setTagKeyLoading] = useState<boolean>(false);
  const [tagValueLoading, setTagValueLoading] = useState<boolean>(false);
  const [changedTagKey, setChangedTagKey] = useState<boolean>(false);
  const [errorTip, setErrorTip] = useState<string>('');
  useEffect(() => {
    let nextErrorTip = '';

    if (Array.isArray(data.nonNameList) && data.nonNameList.includes(index)) {
      nextErrorTip = NAME_NON_EXISTENT;
    } else if (
      Array.isArray(data.requireList) &&
      data.requireList.includes(index)
    ) {
      nextErrorTip = NAME_REQUIRE;
    } else if (
      Array.isArray(data.invalidList) &&
      data.invalidList.includes(index)
    ) {
      nextErrorTip = NAME_INVALID;
    } else if (
      Array.isArray(data.duplicateList) &&
      data.duplicateList.includes(index)
    ) {
      nextErrorTip = NAME_DUPLICATE;
    } else if (
      Array.isArray(data.duplicateKeyList) &&
      data.duplicateKeyList.includes(index)
    ) {
      nextErrorTip = KEY_UNIQUE;
    }

    setErrorTip(nextErrorTip);
  }, [
    JSON.stringify(data.duplicateList),
    JSON.stringify(data.duplicateKeyList),
    JSON.stringify(data.nonNameList),
    JSON.stringify(data.invalidList),
    JSON.stringify(data.requireList),
    t,
  ]);
  useEffect(() => {
    // 仅是classpath内容回显, 避免id直接展示
    if (
      (tagData.key === CLASS_PATH_VALUE ||
        tagData.key === CLASS_PATH_PREFIX_VALUE) &&
      valueOptions.length === 1
    ) {
      fetchTagValue();
    }
  }, [tagData.value, tagData.key]);

  const handleChangeTagkey = (key: string) => {
    setChangedTagKey(true);
    setValueOptions([DEFAULT_VALUE]);
    dispatch({
      type: UPDATE_ITEM,
      index,
      data: { ...tagData, key, value: DEFAULT_VALUE },
    });
  };

  const handleChangeName = (e) => {
    const value = e.target.value;
    dispatch({
      type: UPDATE_ITEM,
      index,
      data: { ...tagData, tagName: value },
    });

    if (value && errorTip === NAME_NON_EXISTENT) {
      setErrorTip('');
    }
  };

  const handleTagClick = () => {
    fetchTagKey('');
  };

  const handleSearchTagkey = debounce((key) => {
    fetchTagKey(key);
  }, 500);

  const fetchTagKey = (key = '') => {
    // 当 其他项 已选择classpath时，下拉项中不展示classpath
    const hasClassPath = data.tagList.find(
      (item, key) => key !== index && item.key.includes(CLASS_PATH),
    );
    const appendClasspath = !hasClassPath && CLASS_PATH.indexOf(key) === 0;
    setTagKeyLoading(true);
    getTagKey({
      limit: PAGE_SIZE_OPTION_LARGE,
      tag_key: key,
      params: [
        {
          metric: tagData.metric,
        },
      ],
    })
      .then((res) => {
        if (res.dat.keys) {
          if (appendClasspath) {
            setTagKeyOptions([
              CLASS_PATH_VALUE,
              CLASS_PATH_PREFIX_VALUE,
              ...res.dat.keys,
            ]);
          } else {
            setTagKeyOptions([...res.dat.keys]);
          }
        }
      })
      .finally(() => {
        setTagKeyLoading(false);
      });
  };

  const fetchTagValue = (value = '') => {
    return new Promise((resolve) => {
      if (tagData.key) {
        setTagValueLoading(true);

        if (
          tagData.key === CLASS_PATH_VALUE ||
          tagData.key === CLASS_PATH_PREFIX_VALUE
        ) {
          getResourceGroups(value)
            .then((res) => {
              setValueOptions([DEFAULT_CLASSPATH_DATA, ...res.dat.list]);
            })
            .finally(() => {
              setTagValueLoading(false);
            });
        } else {
          const determinedTagValues = data.tagList
            .filter((item) => {
              return (
                item.value !== '*' &&
                item.key !== tagData.key &&
                !item.key.includes(CLASS_PATH)
              );
            })
            .map(({ key, value }) => {
              return {
                key,
                value,
              };
            });
          getTagValue({
            limit: PAGE_SIZE_OPTION_LARGE,
            tag_key: tagData.key,
            tag_value: value,
            params: [
              {
                metric: tagData.metric,
              },
            ],
            tags:
              determinedTagValues.length > 0 ? determinedTagValues : undefined,
          })
            .then((res) => {
              if (res.dat.values) {
                resolve('');
                setValueOptions([DEFAULT_VALUE, ...res.dat.values]);
              }
            })
            .finally(() => {
              setTagValueLoading(false);
            });
        }
      }
    });
  };

  const handleSearchTagValue = debounce((value) => {
    if (value) {
      fetchTagValue(value);
    } else {
      setValueOptions([DEFAULT_VALUE]);
    }
  }, 500);

  const handleChangeTagValue = (value) => {
    dispatch({
      type: UPDATE_ITEM,
      index,
      data: { ...tagData, value: value },
    });
  };

  const handleValueClick = () => {
    // if (changedTagKey || (!isEditing && valueOptions.length === 1)) {
    if (valueOptions.length === 1) {
      fetchTagValue().then(() => {
        setChangedTagKey(false);
      });
    }
  };

  const handleDeleteItem = () => {
    dispatch({
      type: DELETE_ITEM,
      index: index,
    });
  };

  const handleMetricChange = (metric) => {
    dispatch({
      type: UPDATE_ITEM,
      index,
      data: { ...tagData, value: '', key: '', metric },
    });
  };

  const renderOpen = () => {
    return (
      <Row gutter={[6, 6]} className='tag-content-item'>
        <Col span={3}>
          <Input value={tagData.tagName} onChange={handleChangeName}></Input>
        </Col>
        <Col span={6}>
          <MetricTable
            onChange={handleMetricChange}
            multiple={false}
            value={tagData.metric}
          />
        </Col>
        <Col span={4}>
          <Select
            style={{
              width: '100%',
            }}
            disabled={!tagData.metric}
            onSearch={handleSearchTagkey}
            onChange={handleChangeTagkey}
            defaultActiveFirstOption={false}
            showSearch
            loading={tagKeyLoading}
            value={tagData.key}
            allowClear
            onClick={handleTagClick}
            dropdownClassName='overflow-230'
            placeholder={t('任意标签/资源分组')}
          >
            {tagKeyOptions.map((tag, index) => (
              <Option key={index} value={tag}>
                {tag}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Select
            style={{
              width: '100%',
            }}
            disabled={!tagData.metric}
            onSearch={handleSearchTagValue}
            onChange={handleChangeTagValue}
            defaultActiveFirstOption={false}
            showSearch
            loading={tagValueLoading}
            value={tagData.value}
            placeholder={t('任意标签/资源分组')}
            onClick={handleValueClick}
            dropdownClassName='overflow-586'
          >
            {tagData.key === CLASS_PATH_VALUE ||
            tagData.key === CLASS_PATH_PREFIX_VALUE
              ? valueOptions.map((value, index) => (
                  <Option key={index + 1000} value={value.id}>
                    {value.path}
                  </Option>
                ))
              : valueOptions.map((value, index) => (
                  <Option key={index} value={value}>
                    {value}
                  </Option>
                ))}
          </Select>
        </Col>
        <Col span={1}>
          <DeleteOutlined onClick={handleDeleteItem} className={'icon'} />
          {/* {tagData.key === CLASS_PATH_VALUE ? (
            <Checkbox
              className={'icon'}
              checked={tagData.prefix}
              onClick={handleClickPrefix}
            ></Checkbox>
          ) : null} */}
        </Col>
        {errorTip && (
          <Col span={5}>
            <div className='error-tips'>{errorTip}</div>
          </Col>
        )}
      </Row>
    );
  };

  const renderClose = () => {
    return (
      <div className='tag-content-close-item'>
        <div className='tag-content-close-item-tagName'>${tagData.tagName}</div>
        <Select
          style={{
            width: '180px',
          }}
          onSearch={handleSearchTagValue}
          onChange={handleChangeTagValue}
          defaultActiveFirstOption={false}
          showSearch
          loading={tagValueLoading}
          value={tagData.value}
          placeholder={t('任意标签/资源分组')}
          onClick={handleValueClick}
          dropdownClassName='overflow-586'
        >
          {tagData.key === CLASS_PATH_VALUE ||
          tagData.key === CLASS_PATH_PREFIX_VALUE
            ? valueOptions.map((value, index) => (
                <Option key={index + 1000} value={value.id}>
                  {value.path}
                </Option>
              ))
            : valueOptions.map((value) => (
                <Option key={value} value={value}>
                  {value}
                </Option>
              ))}
        </Select>
        {/* {tagData.key === CLASS_PATH_VALUE ? (
          <Checkbox
            className={'icon'}
            checked={tagData.prefix}
            onClick={handleClickPrefix}
          ></Checkbox>
        ) : null} */}
      </div>
    );
  };

  return <>{isEditing ? renderOpen() : renderClose()}</>;
};

export default TagItem;
