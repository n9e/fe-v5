import React, {
  useEffect,
  useState,
  useImperativeHandle,
  ReactNode,
} from 'react';
import { Form, Input } from 'antd';
import { layout } from '../../const';
import { getTeamInfo } from '@/services/manage';
import { TeamProps, Team, TeamInfo } from '@/store/manageInterface';
import { useTranslation } from 'react-i18next';
const TeamForm = React.forwardRef<ReactNode, TeamProps>((props, ref) => {
  const { t } = useTranslation();
  const { teamId } = props;
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState<Team>();
  const [loading, setLoading] = useState<boolean>(true);
  useImperativeHandle(ref, () => ({
    form: form,
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

  return !loading ? (
    <Form
      {...layout}
      form={form}
      initialValues={initialValues}
      preserve={false}
    >
      <Form.Item
        label={t('团队名称')}
        name='name'
        rules={[
          {
            required: true,
            message: t('团队名称不能为空！'),
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label={t('备注')} name='note'>
        <Input />
      </Form.Item>
    </Form>
  ) : null;
});
export default TeamForm;
