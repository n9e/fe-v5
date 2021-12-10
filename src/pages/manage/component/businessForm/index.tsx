import React, { useEffect, useState, useImperativeHandle, ReactNode } from 'react';
import { Form, Input, Select, Switch, Row, Col, Space, Button } from 'antd';
import { layout } from '../../const';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { getBusinessTeamInfo, getTeamInfoList } from '@/services/manage';
import { TeamProps, Team, TeamInfo, ActionType } from '@/store/manageInterface';
import { useTranslation } from 'react-i18next';

const { Option } = Select;
const TeamForm = React.forwardRef<ReactNode, TeamProps>((props, ref) => {
  const { t } = useTranslation();
  const { businessId, action } = props;
  const [form] = Form.useForm();
  const [userTeam, setUserTeam] = useState<Team[]>([]);
  const [initialValues, setInitialValues] = useState({
    members: [{ perm_flag: true }],
    name: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  useImperativeHandle(ref, () => ({
    form: form,
  }));

  useEffect(() => {
    if (businessId && action === ActionType.EditBusiness) {
      getTeamInfoDetail(businessId);
    } else {
      setLoading(false);
    }
  }, []);

  const getTeamInfoDetail = (id: string) => {
    getBusinessTeamInfo(id).then((data: { name: string; user_groups: { perm_flag: string; user_group: { id: number } }[] }) => {
      setInitialValues({
        name: data.name,
        members: data.user_groups.map((item) => ({
          perm_flag: item.perm_flag === 'rw',
          user_group_id: item.user_group.id,
        })),
      });
      setLoading(false);
    });
  };

  useEffect(() => {
    getTeamInfoList().then((res) => {
      setUserTeam(res.dat);
    });
  }, []);

  return !loading ? (
    <Form {...layout} form={form} initialValues={initialValues} preserve={false}>
      {action !== ActionType.AddBusinessMember && (
        <Form.Item
          label={t('业务组名称')}
          name='name'
          rules={[
            {
              required: true,
              message: t('业务组名称不能为空！'),
            },
          ]}
        >
          <Input />
        </Form.Item>
      )}

      {(action === ActionType.CreateBusiness || action === ActionType.AddBusinessMember) && (
        <Form.Item
          label={t('团队')}
          required
          // tooltip={{
          //   title: '默认可读勾选可写',
          // }}
        >
          <Form.List name='members'>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                    <Form.Item
                      style={{ width: 450 }}
                      {...restField}
                      name={[name, 'user_group_id']}
                      fieldKey={[fieldKey, 'user_group_id']}
                      rules={[{ required: true, message: t('业务组团队不能为空！') }]}
                    >
                      <Select style={{ width: '100%' }}>
                        {userTeam.map((team) => (
                          <Option key={team.id} value={team.id}>
                            {team.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'perm_flag']} fieldKey={[fieldKey, 'perm_flag']} valuePropName='checked'>
                      <Switch checkedChildren='读写' unCheckedChildren='只读' />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                    添加团队
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      )}
    </Form>
  ) : null;
});
export default TeamForm;
