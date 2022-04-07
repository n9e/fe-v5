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
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resourceStoreState, prefixType } from '@/store/businessInterface';
import { tableTabs } from './constant';
import FormButtonModal from '@/components/BaseModal/formButtonModal';
import { createResourceGroupModal } from './constant';
import { Tabs, Checkbox, Modal } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { TabPane } = Tabs;
const { confirm } = Modal;
import { RootState } from '@/store/common';

const PageTable: React.FC = () => {
  const { t } = useTranslation();
  const resource = useSelector<RootState, resourceStoreState>(
    (state) => state.resource,
  );
  const [tabActiveKey, setActiveKey] = useState<string>(tableTabs(t)[0].key);
  const dispatch = useDispatch();

  const handleChangePrefix = (e: CheckboxChangeEvent) => {
    dispatch({
      type: 'resource/updatePrefix',
      data: e.target.checked ? prefixType.Need : prefixType.UnNeed,
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    confirm({
      title: t('是否确定删除资源分组?'),
      icon: <ExclamationCircleOutlined />,
      onOk: () => {
        dispatch({
          type: `resource/deleteGroup`,
          id: resource?.currentGroup?.id,
        });
      },

      onCancel() {},
    });
  };

  return (
    <div className='resource-table-content'>
      <div>
        <div className='resource-table-title'>
          <div className='resource-table-title-label'>
            {resource?.currentGroup?.path || ''}
            <FormButtonModal
              {...createResourceGroupModal(
                t,
                resource?.currentGroup || {},
                false,
              )}
            ></FormButtonModal>
            {resource && (
              <DeleteOutlined
                onClick={handleDelete}
                style={{
                  marginLeft: 8,
                }}
              />
            )}
          </div>
          <div className='resource-table-title-sub'>
            <Checkbox
              checked={Boolean(resource.prefix)}
              onChange={handleChangePrefix}
              style={{
                color: 'rgb(102, 102, 102)',
              }}
            >
              {t('分组名称前缀匹配(聚合展示所有相关分组的内容)')}
            </Checkbox>
            <div className='resource-table-title-sub-item'>
              {t('备注')}：{resource?.currentGroup?.note || ''}
            </div>
          </div>
        </div>
        <Tabs activeKey={tabActiveKey} onChange={setActiveKey}>
          {tableTabs(t).map((tabItem) => (
            <TabPane tab={tabItem.title} key={tabItem.key}>
              <tabItem.component
                currentKey={tabItem.key}
                activeKey={tabActiveKey}
                isIdent={true} //图表组件props
              ></tabItem.component>
            </TabPane>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default PageTable;
