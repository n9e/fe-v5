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
import React, { useEffect, useState, useImperativeHandle, ReactNode } from 'react';
import { Form, Input } from 'antd';
import { layout } from '../../const';
import { getTeamInfo } from '@/services/manage';
import { TeamProps, Team, TeamInfo } from '@/store/manageInterface';
import { useTranslation } from 'react-i18next';
const TeamForm = React.forwardRef<ReactNode, TeamProps>((props, ref) => {
  const {
    t
  } = useTranslation();
  const {
    teamId
  } = props;
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState<Team>();
  const [loading, setLoading] = useState<boolean>(true);
  useImperativeHandle(ref, () => ({
    form: form
  }));
  useEffect(() => {
    if (teamId) {
      getTeamInfoDetail(teamId);
    } else {
      setLoading(false);
    }
  }, []);

  const getTeamInfoDetail = (id: string) => {
    getTeamInfo(id).then((data: TeamInfo) => {
      setInitialValues(data.user_group);
      setLoading(false);
    });
  };

  return !loading ? <Form {...layout} form={form} initialValues={initialValues} preserve={false}>
      <Form.Item label={t('团队名称')} name='name' rules={[{
      required: true,
      message: t('团队名称不能为空！')
    }]}>
        <Input />
      </Form.Item>
      <Form.Item label={t('备注')} name='note'>
        <Input />
      </Form.Item>
    </Form> : null;
});
export default TeamForm;