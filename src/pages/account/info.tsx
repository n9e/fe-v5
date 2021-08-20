import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Form,
  Input,
  Button,
  Modal,
  Row,
  Col,
  message,
  Space,
  Select,
} from 'antd';
import { getContactsList } from '@/services/manage';
import { RootState, accountStoreState } from '@/store/accountInterface';
import { ContactsItem } from '@/store/manageInterface';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Option } = Select;
export default function Info() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [contactsList, setContactsList] = useState<ContactsItem[]>([]);
  let { profile } = useSelector<RootState, accountStoreState>(
    (state) => state.account,
  );
  const [selectAvatar, setSelectAvatar] = useState<string>(
    profile.portrait || '/image/avatar1.png',
  );
  const [customAvatar, setCustomAvatar] = useState('');
  const dispatch = useDispatch();
  useEffect(() => {
    const { id, nickname, email, phone, contacts, portrait } = profile;

    // if (id) {
    form.setFieldsValue({
      nickname,
      email,
      phone,
      contacts,
    });
    // }
    if (portrait.startsWith('http')) {
      setCustomAvatar(portrait);
    }
  }, [profile]);
  useEffect(() => {
    getContactsList().then((data: Array<ContactsItem>) => {
      setContactsList(data);
    });
  }, []);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      updateProfile();
    } catch (err) {
      console.log(t('输入有误'), err);
    }
  };

  const handleOk = () => {
    if (customAvatar) {
      if (!customAvatar.startsWith('http')) {
        message.error(t('自定义头像需以http开头'));
        return;
      }

      fetch(customAvatar)
        .then((res) => {
          setIsModalVisible(false);
          handleSubmit();
        })
        .catch((err) => {
          message.error(t('自定义头像') + err);
        });
    } else {
      setIsModalVisible(false);
      handleSubmit();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const updateProfile = () => {
    const { nickname, email, phone, moreContacts } = form.getFieldsValue();
    let { contacts } = form.getFieldsValue();

    if (moreContacts && moreContacts.length > 0) {
      moreContacts.forEach((item) => {
        const { key, value } = item;

        if (key && value) {
          if (contacts) {
            contacts[key] = value;
          } else {
            contacts = {
              [key]: value,
            };
          }
        }
      });
    }

    for (let key in contacts) {
      if (!contacts[key]) {
        delete contacts[key];
      }
    }

    dispatch({
      type: 'account/updateProfile',
      data: {
        ...profile,
        portrait: customAvatar || selectAvatar,
        nickname,
        email,
        phone,
        contacts,
      },
    });
    message.success(t('信息保存成功'));
  };

  const avatarList = new Array(8).fill(0).map((_, i) => i + 1);

  const handleImgClick = (i) => {
    setSelectAvatar(`/image/avatar${i}.png`);
  };

  return (
    <>
      <Form form={form} layout='vertical'>
        <Row
          gutter={16}
          style={{
            marginBottom: '24px',
          }}
        >
          <Col span={20}>
            <Row
              gutter={16}
              style={{
                marginBottom: '24px',
              }}
            >
              <Col span={4}>
                <div>
                  <label>{t('用户名')}：</label>
                  <span>{profile.username}</span>
                </div>
              </Col>
              <Col span={4}>
                <div>
                  <label>{t('角色')}：</label>
                  <span>{profile.roles.join(', ')}</span>
                </div>
              </Col>
            </Row>
            <Form.Item label={<span>{t('显示名')}：</span>} name='nickname'>
              <Input placeholder={t('请输入显示名')} />
            </Form.Item>
            <Form.Item label={<span>{t('邮箱')}：</span>} name='email'>
              <Input placeholder={t('请输入邮箱')} />
            </Form.Item>
            <Form.Item label={<span>{t('手机')}：</span>} name='phone'>
              <Input placeholder={t('请输入手机号')} />
            </Form.Item>

            {profile.contacts &&
              Object.keys(profile.contacts)
                .sort()
                .map((key, i) => {
                  let contact = contactsList.find((item) => item.key === key);
                  return (
                    <>
                      {contact ? (
                        <Form.Item
                          label={contact.label + '：'}
                          name={['contacts', key]}
                          key={i}
                        >
                          <Input placeholder={`${t('请输入')}${key}`} />
                        </Form.Item>
                      ) : null}
                    </>
                  );
                })}

            <Form.Item label={t('更多联系方式')}>
              <Form.List name='moreContacts'>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, fieldKey, ...restField }) => (
                      <Space
                        key={key}
                        style={{
                          display: 'flex',
                        }}
                        align='baseline'
                      >
                        <Form.Item
                          style={{
                            width: '180px',
                          }}
                          {...restField}
                          name={[name, 'key']}
                          fieldKey={[fieldKey, 'key']}
                          rules={[
                            {
                              required: true,
                              message: t('联系方式不能为空'),
                            },
                          ]}
                        >
                          <Select placeholder={t('请选择联系方式')}>
                            {contactsList.map((item, index) => (
                              <Option value={item.key} key={index}>
                                {item.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          style={{
                            width: '330px',
                          }}
                          name={[name, 'value']}
                          fieldKey={[fieldKey, 'value']}
                          rules={[
                            {
                              required: true,
                              message: t('值不能为空'),
                            },
                          ]}
                        >
                          <Input placeholder={t('请输入值')} />
                        </Form.Item>
                        <MinusCircleOutlined
                          className='control-icon-normal'
                          onClick={() => remove(name)}
                        />
                      </Space>
                    ))}
                    <PlusCircleOutlined
                      className='control-icon-normal'
                      onClick={() => add()}
                    />
                  </>
                )}
              </Form.List>
            </Form.Item>

            <Form.Item>
              <Button type='primary' onClick={handleSubmit}>
                {t('确认修改')}
              </Button>
            </Form.Item>
          </Col>
          <Col span={4}>
            <div className='avatar'>
              <img src={profile.portrait || '/image/avatar1.png'} />
              <Button
                type='primary'
                className='update-avatar'
                onClick={() => setIsModalVisible(true)}
              >
                {t('更换头像')}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
      <Modal
        title={t('更换头像')}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        wrapClassName='avatar-modal'
      >
        <div className='avatar-content'>
          {avatarList.map((i) => {
            return (
              <div
                key={i}
                className={
                  `/image/avatar${i}.png` === selectAvatar
                    ? 'avatar active'
                    : 'avatar'
                }
                onClick={() => handleImgClick(i)}
              >
                <img src={`/image/avatar${i}.png`} />
              </div>
            );
          })}
        </div>
        <Input
          addonBefore={<span>{t('头像URL')}:</span>}
          onChange={(e) => setCustomAvatar(e.target.value)}
          value={customAvatar}
        />
      </Modal>
    </>
  );
}
