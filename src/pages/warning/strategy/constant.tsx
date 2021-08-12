import React from 'react';
import { IFormButtonModalProps } from '@/components/BaseModal/formButtonModal';
import { Button, Form, Select, Input } from 'antd';
import { Team } from '@/store/manageInterface';
import { addStrategyGroup, updateStrategyGroup } from '@/services/warning';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
interface formStrategyType {
  name: string;
  user_group_ids: Array<string> | string;
}
const { Option } = Select;
export const createGroupModel = (
  isCreate: boolean,
  teamList: Team[],
  t: any,
  fieldsData?: any,
  afterSubmit?: () => unknown,
): IFormButtonModalProps => {
  return {
    customizeButton: isCreate ? (
      <a type='primary'>{t('strategy.create')}</a>
    ) : (
      <EditOutlined
        title={t('刷新')}
        style={{
          marginLeft: '8px',
          fontSize: '14px',
        }}
      ></EditOutlined>
    ),
    modalName: isCreate ? t('新建策略分组') : t('编辑策略组'),
    setFields: (form) => {
      if (typeof fieldsData?.user_group_ids === 'string') {
        fieldsData.user_group_ids =
          fieldsData.user_group_ids.length > 0
            ? fieldsData.user_group_ids.split(' ').map((item) => Number(item))
            : [];
      }

      form.setFieldsValue(fieldsData);
    },
    handlePromiseOk: isCreate ? addStrategyGroup : updateStrategyGroup,
    beforePromiseOk: (values: formStrategyType) => {
      if (Array.isArray(values.user_group_ids)) {
        values.user_group_ids = values.user_group_ids.join(' ');
      }

      return values;
    },
    formLayout: 'horizontal',
    afterPromiseOk: (data, values, dispatch) => {
      dispatch({
        type: 'strategy/getGroup',
        sign: 'refresh',
      });
      afterSubmit && afterSubmit();
    },
    children: (
      <>
        <Form.Item
          name={'name'}
          key={'name'}
          label={t('策略组名称')}
          rules={[
            {
              required: true,
              message: t('策略组名称必填'),
            },
          ]}
        >
          <Input placeholder={t('请填写策略组名称')}></Input>
        </Form.Item>
        <Form.Item
          name={'user_group_ids'}
          key={'user_group_ids'}
          label={t('管理团队')}
        >
          <Select mode='multiple' placeholder={t('请选择团队')}>
            {teamList.map((teamItem) => (
              <Option key={teamItem.id} value={teamItem.id}>
                {teamItem.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name={'id'} key={'id'} noStyle></Form.Item>
      </>
    ),
  };
};
