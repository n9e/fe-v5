/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, ChangeEvent, useRef, useLayoutEffect } from 'react';
import { Button, Col, Modal, Row, Image } from 'antd';
import SearchInput from '../BaseSearchInput';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import classnames from 'classnames';
import ErrorComponent from '../ErrorComponent';
import {
  StarOutlined,
  StarFilled,
  ExclamationCircleOutlined,
  SmallDashOutlined,
} from '@ant-design/icons';
import {
  favoriteFrom,
  baseFavoriteItem,
  favoriteType,
  RootState,
} from '@/store/common';
import { useHistory } from 'react-router';
import { debounce } from 'lodash';

import classNames from 'classnames';
import { useParams } from 'react-router';
import './index.less';
import { PAGE_SIZE } from '@/utils/constant';
import { createResourceGroupModal } from '@/pages/resource/component/constant';
import FormButtonModal from '@/components/BaseModal/formButtonModal';
import { createGroupModel } from '@/pages/warning/strategy/constant';
import { getTeamInfoList } from '@/services/manage';
import { Team } from '@/store/manageInterface';
import { useTranslation } from 'react-i18next';
import ListTree from '../ListTree';
const { confirm } = Modal;
interface ILeftTreeProps {
  pathKey?: string;
  treeType?: string;
  typeName: string;
  pageTitle?: string;
}
interface IGroupItemProps {
  isFavorite: boolean;
  groupType: favoriteFrom;
  item: baseFavoriteItem;
  pathKey: string;
  treeType: string;
  typeName: string;
}

const GroupItem: React.FC<IGroupItemProps> = function ({
  item,
  groupType,
  pathKey,
  treeType,
}) {
  const { t } = useTranslation();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const dispatch = useDispatch();
  const treeData = useSelector<RootState, any>((state) => state[treeType]);
  const [nextTitle, setNextTitle] = useState<string>('');
  const history = useHistory();
  useEffect(() => {
    setNextTitle(item[pathKey]);
  }, [item[pathKey]]);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNextTitle(e.target.value);
  };

  const handleOnBlur = () => {
    setIsEdit(false);

    if (nextTitle === item[pathKey] || nextTitle === '') {
      setNextTitle(item[pathKey]);
    } else {
      dispatch({
        type: `${treeType}/updateGroup`,
        id: item.id,
        data: { ...item, [pathKey]: nextTitle },
      });
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEdit(true);
  };

  const handleFavorite = () => {
    dispatch({
      type: `${treeType}/changeGroupFavorite`,
      id: item.id,
      favorType: item.isFavorite ? favoriteType.Delete : favoriteType.Add,
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    confirm({
      title: t('是否确定删除?'),
      icon: <ExclamationCircleOutlined />,
      onOk: () => {
        dispatch({
          type: `${treeType}/deleteGroup`,
          id: item.id,
        });
      },

      onCancel() {},
    });
  };

  const handleChooseItem = () => {
    history.push({
      pathname: `/${treeType}/${item.id}`,
    });
    dispatch({
      type: `${treeType}/chooseGroupItem`,
      data: item,
    });
  };

  return (
    <ErrorComponent>
      <div
        className={classnames(
          'left-tree-item',
          treeData?.currentGroup?.id === item.id &&
            treeData?.currentGroup?.isBelongIn === groupType
            ? 'left-tree-item-active'
            : '',
        )}
        onClick={handleChooseItem}
        // onDoubleClick={handleEdit}
      >
        {item.isFavorite ? (
          <StarFilled
            onClick={handleFavorite}
            className={classnames(
              'left-tree-item-icon',
              'left-tree-item-icon-active',
            )}
          ></StarFilled>
        ) : (
          <StarOutlined
            onClick={handleFavorite}
            className='left-tree-item-icon'
          ></StarOutlined>
        )}
        {!isEdit ? (
          <div className='left-tree-item-title' title={item[pathKey] || ''}>
            {item[pathKey] || ''}
          </div>
        ) : (
          <input
            autoFocus
            className='left-tree-item-input'
            onChange={handleOnChange}
            onBlur={handleOnBlur}
            value={nextTitle}
          ></input>
        )}
        {/* <div className='left-tree-item-control-area'>
         <div className='left-tree-item-control-area-item'>
           <FormOutlined
             onClick={handleEdit}
             title={'编辑名称'}
           ></FormOutlined>
         </div>
         <div
           className={classNames(
             'left-tree-item-control-area-item',
             'left-tree-item-control-area-item-delete',
           )}
         >
           <DeleteOutlined
             onClick={handleDelete}
             title={'删除'}
           ></DeleteOutlined>
         </div>
        </div> */}
      </div>
    </ErrorComponent>
  );
};

export const GroupMemoItem = React.memo(GroupItem);

const LeftTree: React.FC<ILeftTreeProps> = ({
  pathKey = 'path',
  treeType = 'resource',
  typeName,
  pageTitle,
}) => {
  const { t, i18n } = useTranslation(); // 新增策略分组
  const [isTree, setisTree] = useState<boolean>(
    localStorage.getItem('isTree') === null
      ? false
      : localStorage.getItem('isTree') === 'false'
      ? false
      : true,
  );
  const [treeQuery, setTreeQuery] = useState<string>('');
  const [teamList, setTeamList] = useState<Array<Team>>([]);
  const [treeheight, setTreeheight] = useState<number>(
    document.getElementById('treeList')?.offsetHeight as number,
  );
  // window.onresize = function () {
  //   setTreeheight(document.getElementById('treeList')?.offsetHeight as number);
  // };
  // window.ondom = function () {
  //   setTreeheight(document.getElementById('treeList')?.offsetHeight as number);
  // };
  useLayoutEffect(() => {
    setTreeheight(document.getElementById('treeList')?.offsetHeight as number);
  });
  const searchRef = useRef(null);
  useEffect(() => {
    setTreeheight(document.getElementById('treeList')?.offsetHeight as number);

    getTeamInfoList().then((data) => {
      setTeamList(data?.dat?.list || []);
    });
  }, []);
  const params = useParams<{
    id: string;
  }>();
  const {
    group: { favorite, common, commonTotal, currentPage },
  } = useSelector<RootState, any>((state) => state[treeType]);
  const dispatch = useDispatch();
  useEffect(() => {
    initData();
  }, []);
  useEffect(() => {
    handleSearch(treeQuery);
  }, [isTree]);
  const initData = () => {
    dispatch({
      type: `${treeType}/getGroup`,
      sign: 'init',
      data: params?.id || '',
    });
  };

  const handleSearch = (keyword: string) => {
    if (treeType === 'resource' && isTree) {
      setTreeQuery(keyword);
    }
    if (!isTree || treeType !== 'resource') {
      dispatch({
        type: `${treeType}/getGroup`,
        sign: 'search',
        data: keyword,
      });
    }
  };
  // 给tree模式的搜素
  // const handleInput = debounce((val) => {
  //   if (treeType === 'resource' && isTree) {
  //     setTreeQuery(val.target.value);
  //   }
  // }, 500);

  const handleAppend = () => {
    dispatch({
      type: `${treeType}/getGroup`,
      sign: 'append',
    });
  };
  const toTree = () => {
    if (isTree) {
      setTreeheight(
        document.getElementById('treeList')?.offsetHeight as number,
      );
    }
    setisTree(() => {
      localStorage.setItem('isTree', JSON.stringify(!isTree));
      return !isTree;
    });
  };

  return (
    <div className={'left-tree-area'}>
      {/* <div className={'left-tree-area-item page-title'}>{pageTitle}</div> */}
      <div className={'left-tree-area-item'}>
        <div className={'left-tree-area-item-title'}>
          {t('收藏的')}
          {typeName}
        </div>
        <div
          className={'left-tree-area-item-list'}
          style={{ maxHeight: 146, overflowY: 'auto' }}
        >
          {favorite.map((item) => (
            <GroupMemoItem
              key={item.id}
              isFavorite
              item={item}
              pathKey={pathKey}
              treeType={treeType}
              typeName={typeName}
              groupType={favoriteFrom.Favorite}
            ></GroupMemoItem>
          ))}
        </div>
      </div>
      <div className={'left-tree-area-item'}>
        <Row>
          <Col span={16}>
            <div className={'left-tree-area-item-title'}>
              {t('所有')}
              {typeName}
            </div>
          </Col>

          <Col
            style={{
              lineHeight: '38px',
              textAlign: 'right',
            }}
            span={8}
          >
            {typeName === t('策略分组') ? (
              <FormButtonModal
                {...createGroupModel(true, teamList, t)}
              ></FormButtonModal>
            ) : (
              <FormButtonModal
                {...createResourceGroupModal(t)}
              ></FormButtonModal>
            )}
          </Col>
        </Row>
        {treeType == 'resource' ? (
          <Row align='middle'>
            <Col span={2}>
              <div
                style={{ cursor: 'pointer', paddingTop: 8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toTree();
                }}
              >
                {isTree ? (
                  <Button
                    className={'treeImg'}
                    style={{
                      height: 32,
                      marginBottom: 8,
                      paddingTop: 7,
                      padding: '0 5px',
                    }}
                  >
                    <Image width={20} preview={false} src={'/image/list.svg'} />
                  </Button>
                ) : (
                  <Button
                    className={'treeImg'}
                    style={{
                      height: 32,
                      marginBottom: 8,
                      paddingTop: 7,
                      padding: '0 5px',
                    }}
                  >
                    <Image
                      style={{ boxSizing: 'border-box', padding: 2 }}
                      width={20}
                      preview={false}
                      src={'/image/tree.svg'}
                    />
                  </Button>
                )}
              </div>
            </Col>
            <Col span={20} offset={2}>
              <SearchInput
                className={'left-tree-area-item-input'}
                onSearch={handleSearch}
                // onInput={handleInput}
              ></SearchInput>
            </Col>
          </Row>
        ) : (
          <SearchInput
            className={'left-tree-area-item-input'}
            onSearch={handleSearch}
          ></SearchInput>
        )}
      </div>

      <div
        id='treeList'
        className={'left-tree-area-item'}
        style={{ flex: 1, overflowY: 'auto' }}
      >
        <div className={'left-tree-area-item-list'}>
          {isTree && treeType === 'resource' ? (
            <ListTree
              treeHeight={treeheight}
              query={treeQuery}
              isretry={common}
              treeType={treeType}
            ></ListTree>
          ) : (
            common.map((item) => {
              return (
                <GroupMemoItem
                  key={item.id}
                  isFavorite={false}
                  item={item}
                  groupType={favoriteFrom.Common}
                  pathKey={pathKey}
                  treeType={treeType}
                  typeName={typeName}
                ></GroupMemoItem>
              );
            })
          )}
        </div>

        {isTree && treeType === 'resource' ? null : PAGE_SIZE * currentPage <
          commonTotal ? (
          <SmallDashOutlined className={'load-more'} onClick={handleAppend} />
        ) : null}
      </div>
    </div>
  );
};

export default LeftTree;
