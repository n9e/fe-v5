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
import React from 'react';
import {
  Row,
  Col,
  Input,
  Select,
  Spin,
  Card,
  Button,
  message,
  Modal,
  Tag,
} from 'antd';
import {
  resourceStoreState,
  resourceGroupItem,
} from '@/store/businessInterface';
import {
  deleteResource,
  updateResourceDetailNote,
  updateResourceDetailTags,
  updateResourceToGroup,
} from '@/services/resource';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { RootState } from '@/store/common';
import { ExclamationCircleOutlined, EditOutlined } from '@ant-design/icons';
import EditItem from './editItem';
import './index.less';
import Item from 'antd/lib/list/Item';
import { useTranslation } from 'react-i18next';
import FormButtonModal from '@/components/BaseModal/formButtonModal';
import {
  getResourceDetailDrawerProps,
  getRangeDatePickerModal,
  createAddResourceModal,
} from '../constant';

const { Option } = Select;
const { confirm } = Modal;
export const ResourceDetail: React.FC<{ refs: any }> = ({ refs }) => {
  const { t } = useTranslation();
  const {
    group: { common },
    resourceData: { resourceDetail, resourceDetailLoading },
  } = useSelector<RootState, resourceStoreState>((state) => state.resource);
  const dispatch = useDispatch();

  const handleChangeNote = async (value) => {
    if (resourceDetail?.id) {
      const { success } = await updateResourceDetailNote({
        ids: [resourceDetail?.id],
        note: value,
      });

      if (success) {
        dispatch({
          type: 'resource/getResourceItem',
          id: resourceDetail?.id || '',
        });
        (refs?.current as any)?.refreshList();
      }
    }
  };

  const handleChangeClasspath = async (classpaths) => {
    if (resourceDetail?.id) {
      const { success } = await updateResourceToGroup({
        res_idents: resourceDetail?.ident ? [resourceDetail?.ident] : [],
        classpath_ids: classpaths,
      });

      if (success) {
        dispatch({
          type: 'resource/getResourceItem',
          id: resourceDetail?.id || '',
        });
        (refs?.current as any)?.refreshList();
      }
    }
  };

  const handleChangeTags = async (value: string[]) => {
    if (resourceDetail?.id) {
      const { success } = await updateResourceDetailTags({
        ids: [resourceDetail?.id],
        tags: value.join(' '),
      });

      if (success) {
        dispatch({
          type: 'resource/getResourceItem',
          id: resourceDetail?.id || '',
        });
        (refs?.current as any)?.refreshList();
      }
    }
  };

  const tagsValidator = (value: string[]): boolean => {
    let top: string = value[value.length - 1];
    let reg = /\w+=\w+/;

    if (top && !reg.test(top)) {
      return false;
    } else {
      return true;
    }
  };

  const handleDeleteResource = () => {
    if (resourceDetail) {
      const { id, alias } = resourceDetail;
      confirm({
        zIndex: 2001,
        title: `${t('是否确认永久删除资源')}?${alias}`,
        icon: <ExclamationCircleOutlined />,
        onOk: () => {
          deleteResource(id).then(() => {
            (refs?.current as any)?.refreshList();
          });
        },

        onCancel() {},
      });
    }
  };

  const formatTime = () => {
    const muteTime = resourceDetail?.mute_btime || 0;
    const entTime = resourceDetail?.mute_etime || 0;

    if (muteTime === 0 && entTime === 0) {
      return <div></div>;
    } else {
      return (
        <>
          {dayjs(muteTime * 1000).format('YYYY-MM-DD HH:mm:ss')}
          {`\u00a0-\u00a0`}
          {dayjs(entTime * 1000).format('YYYY-MM-DD HH:mm:ss')}
        </>
      );
    }

    return;
  };

  return (
    <div className={'detail-content'}>
      <Spin spinning={resourceDetailLoading}>
        <Card title={t('资源详情')}>
          <Row align='middle' className='row-style'>
            <Col
              span={3}
              style={{
                textAlign: 'right',
              }}
            >
              {t('资源名称')}：
            </Col>
            <Col offset={1}>{resourceDetail?.alias ?? ''}</Col>
          </Row>
          <Row className='row-style'>
            <Col
              span={3}
              style={{
                textAlign: 'right',
              }}
            >
              {t('资源标识')}：
            </Col>
            <Col offset={1}>{resourceDetail?.ident ?? ''}</Col>
          </Row>
          <Row align='middle' className='row-style'>
            <Col
              span={3}
              style={{
                textAlign: 'right',
              }}
            >
              {t('标签')}：
            </Col>
            <Col offset={1}>
              <EditItem
                value={
                  resourceDetail?.tags == ''
                    ? []
                    : resourceDetail?.tags.split(' ')
                }
                editType='select'
                onChange={handleChangeTags}
                validator={tagsValidator}
                selectProps={{
                  mode: 'tags',
                  allowClear: true,
                  placeholder: t('格式为key=value回车分隔'),
                }}
              ></EditItem>
            </Col>
          </Row>
          <Row align='middle' className='row-style'>
            <Col
              span={3}
              style={{
                textAlign: 'right',
              }}
            >
              {t('资源分组')}：
            </Col>
            <Col offset={1}>
              <EditItem
                value={resourceDetail?.classpath_ids || []}
                editType='select'
                onChange={handleChangeClasspath}
                selectProps={{
                  mode: 'multiple',
                  allowClear: true,
                  placeholder: t('请选择所属资源分组'),
                  options: common.map((groupItem: resourceGroupItem) => {
                    return {
                      value: groupItem.id,
                      label: groupItem.path,
                      children: <Tag color='blue'>{groupItem.path}</Tag>,
                    };
                  }),
                }}
              ></EditItem>
            </Col>
          </Row>
          <Row align='middle' className='row-style'>
            <Col
              span={3}
              style={{
                textAlign: 'right',
              }}
            >
              {t('备注')}：
            </Col>
            <Col offset={1}>
              <EditItem
                value={resourceDetail?.note ?? ''}
                editType='input'
                onChange={handleChangeNote}
              ></EditItem>
            </Col>
          </Row>
          <Row align='middle' className='row-style'>
            <Col
              span={3}
              style={{
                textAlign: 'right',
              }}
            >
              {t('屏蔽时间')}：
            </Col>
            <Col offset={1}>{formatTime()}</Col>
            <Col offset={1}>
              <FormButtonModal
                {...getRangeDatePickerModal(
                  {
                    etime: resourceDetail?.mute_etime || 0,
                    btime: resourceDetail?.mute_btime || 0,
                  },
                  [resourceDetail?.id] as number[],
                  () => {
                    dispatch({
                      type: 'resource/getResourceItem',
                      id: resourceDetail?.id || '',
                    });
                    (refs?.current as any)?.refreshList();
                  },
                  t,
                  <EditOutlined className='detail-mute-time' />,
                )}
              ></FormButtonModal>
            </Col>
          </Row>
        </Card>
        <Card
          title={t('彻底删除资源')}
          style={{
            marginTop: 40,
          }}
        >
          <p>{t('两种情况会有彻底删除资源的需求')}</p>
          <p>
            {t('1.')}{' '}
            {t('资源对应的设备已经下线了，永远都不会有新的监控数据上报了')}
          </p>
          <p>
            {t('2.')}{' '}
            {t('资源的ident(唯一标识)发生变化，老的ident需要手工清理掉')}
          </p>
          <Button
            onClick={handleDeleteResource}
            className='clear-button'
            style={{
              float: 'right',
            }}
          >
            {t('彻底删除资源')}
          </Button>
        </Card>
      </Spin>
    </div>
  );
};
export default ResourceDetail;
