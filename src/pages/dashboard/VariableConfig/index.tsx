import React, {
  useImperativeHandle,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { Row, Col } from 'antd';
import TagItem from './TagItem';
import { Button } from 'antd';
import {
  ADD_ITEM,
  CLASS_PATH_VALUE,
  CLASS_PATH_PREFIX_VALUE,
  INIT_DATA,
  TagFilterReducer,
  TagFilterStore,
} from './constant';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { TagDataItem, TagFilterData, TagFilterResponse } from './definition';
import { useEffect } from 'react';
import './index.less';
import { useTranslation } from 'react-i18next';
interface ITagFilterProps {
  isOpen?: boolean;
  onChange: (data: TagFilterResponse) => void;
}

const TagFilter: React.ForwardRefRenderFunction<any, ITagFilterProps> = (
  { isOpen = false, onChange },
  ref,
) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<boolean>(isOpen);
  const [data, dispatch] = useReducer(TagFilterReducer, {
    tagList: [],
    duplicateList: [],
    invalidList: [],
    nonNameList: [],
    hasClassPath: false,
    hasInit: false,
  });
  useEffect(() => {
    if (!editing && data.hasInit) {
      const nextData = packingData();
      onChange && onChange(nextData);
    }
  }, [JSON.stringify(data.tagList)]);

  const addVariable = function () {
    dispatch({
      type: ADD_ITEM,
    });
  };

  const setInitData = (originData) => {
    const data = unpackData(originData);
    dispatch({
      type: INIT_DATA,
      data,
    });
  };

  const packingData = (): TagFilterResponse => {
    const { tagList } = data;
    const tagArray: TagDataItem[] = [];
    let classpath;
    (tagList as TagDataItem[]).forEach((item) => {
      const { key } = item;

      if (key !== CLASS_PATH_VALUE && key !== CLASS_PATH_PREFIX_VALUE) {
        tagArray.push(item);
      } else {
        classpath = item;
      }
    });
    return classpath
      ? {
          tags: tagArray,
          metric: classpath.metric,
          classpath_tagName: classpath?.tagName || '',
          classpath_id: classpath?.value ? classpath?.value : 0,
          classpath_prefix:
            classpath?.key === CLASS_PATH_PREFIX_VALUE
              ? 1
              : classpath?.key === CLASS_PATH_VALUE
              ? 0
              : undefined,
        }
      : {
          tags: tagArray,
        };
  };

  const unpackData = (originData: string) => {
    let data: TagFilterData;

    try {
      const jsonData = JSON.parse(originData);
      const {
        tags,
        classpath_id,
        classpath_prefix,
        classpath_tagName,
        metric,
      } = jsonData;

      if (
        typeof classpath_id !== 'undefined' &&
        typeof classpath_prefix !== 'undefined' &&
        typeof classpath_tagName !== 'undefined'
      ) {
        data = {
          tagList: tags.concat({
            tagName: classpath_tagName,
            key: CLASS_PATH_VALUE,
            value: classpath_id,
            metric,
            prefix: classpath_prefix === 1,
          }),
          hasClassPath: true,
        };
      } else {
        data = {
          tagList: tags,
        };
      }
    } catch (error) {
      data = {
        tagList: [],
      };
    }

    return data;
  };

  const handleFinish = () => {
    setEditing(false);
    const data = packingData();
    onChange && onChange(data);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const buttonUseFul = useMemo(() => {
    if (!data) return true;
    const {
      duplicateList,
      nonNameList,
      invalidList,
      duplicateKeyList,
      requireList,
    } = data;
    return (
      duplicateList.length === 0 &&
      duplicateKeyList.length === 0 &&
      requireList.length === 0 &&
      nonNameList.length === 0 &&
      invalidList.length === 0
    );
  }, [
    JSON.stringify(data.duplicateList),
    JSON.stringify(data.duplicateKeyList),
    JSON.stringify(data.nonNameList),
    JSON.stringify(data.invalidList),
    JSON.stringify(data.requireList),
  ]);
  useImperativeHandle(ref, () => ({
    setInitData,
  }));
  return (
    <TagFilterStore.Provider value={[data, dispatch]}>
      <div className='tag-area'>
        {editing ? (
          <Row gutter={[6, 6]} className='tag-header'>
            <Col span={3}>{t('变量名')}</Col>
            <Col span={6}>Filter metric</Col>
            <Col span={4}>{t('标签或资源分组')}</Col>
            <Col span={4}>{t('默认值')}</Col>
          </Row>
        ) : null}
        <div
          className={classNames(
            'tag-content',
            !editing ? 'tag-content-close' : '',
          )}
        >
          {data.tagList.map((tagItem, index) => (
            <TagItem
              isEditing={editing}
              key={index}
              tagData={tagItem}
              index={index}
            ></TagItem>
          ))}
          {editing ? null : Array.isArray(data.tagList) &&
            data.tagList.length ? (
            <EditOutlined className='icon' onClick={handleEdit}></EditOutlined>
          ) : (
            <div className='add-variable-tips' onClick={handleEdit}>
              {t('添加大盘变量')}
            </div>
          )}
        </div>
        {editing ? (
          <div className='tag-control-area'>
            <Button onClick={addVariable} icon={<PlusOutlined />}>
              {t('添加变量')}
            </Button>
            <Button
              type='primary'
              disabled={!buttonUseFul}
              onClick={handleFinish}
            >
              {t('完成')}
            </Button>
          </div>
        ) : null}
      </div>
    </TagFilterStore.Provider>
  );
};

export default React.forwardRef(TagFilter);
