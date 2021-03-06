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
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Button, Modal, Row, Col, message, Space, Select } from 'antd';
import { getNotifyChannels } from '@/services/manage';
import { RootState, accountStoreState } from '@/store/accountInterface';
import { ContactsItem } from '@/store/manageInterface';
import { MinusCircleOutlined, PlusCircleOutlined, CaretDownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Option } = Select;
export default function Info() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [contactsList, setContactsList] = useState<ContactsItem[]>([]);
  let { profile } = useSelector<RootState, accountStoreState>((state) => state.account);
  const [selectAvatar, setSelectAvatar] = useState<string>(profile.portrait || '/image/avatar1.png');
  const [customAvatar, setCustomAvatar] = useState('');
  const dispatch = useDispatch();
  useEffect(() => {
    const { id, nickname, email, phone, contacts, portrait } = profile;
    form.setFieldsValue({
      nickname,
      email,
      phone,
      contacts,
    });
    if (portrait.startsWith('http')) {
      setCustomAvatar(portrait);
    }
  }, [profile]);
  useEffect(() => {
    getNotifyChannels().then((data: Array<ContactsItem>) => {
      setContactsList(data);
    });
  }, []);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      updateProfile();
    } catch (err) {
      console.log(t('????????????'), err);
    }
  };

  const handleOk = () => {
    if (customAvatar) {
      if (!customAvatar.startsWith('http')) {
        message.error(t('?????????????????????http??????'));
        return;
      }

      fetch(customAvatar, { mode: 'no-cors' })
        .then((res) => {
          setIsModalVisible(false);
          handleSubmit();
        })
        .catch((err) => {
          message.error(t('???????????????') + err);
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
    message.success(t('??????????????????'));
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
                  <label>{t('?????????')}???</label>
                  <span>{profile.username}</span>
                </div>
              </Col>
              <Col span={4}>
                <div>
                  <label>{t('??????')}???</label>
                  <span>{profile.roles.join(', ')}</span>
                </div>
              </Col>
            </Row>
            <Form.Item label={<span>{t('?????????')}???</span>} name='nickname'>
              <Input placeholder={t('??????????????????')} />
            </Form.Item>
            <Form.Item label={<span>{t('??????')}???</span>} name='email'>
              <Input placeholder={t('???????????????')} />
            </Form.Item>
            <Form.Item label={<span>{t('??????')}???</span>} name='phone'>
              <Input placeholder={t('??????????????????')} />
            </Form.Item>

            {profile.contacts &&
              Object.keys(profile.contacts)
                .sort()
                .map((key, i) => {
                  let contact = contactsList.find((item) => item.key === key);
                  return (
                    <>
                      {contact ? (
                        <Form.Item label={contact.label + '???'} name={['contacts', key]} key={i}>
                          <Input placeholder={`${t('?????????')}${key}`} />
                        </Form.Item>
                      ) : null}
                    </>
                  );
                })}

            <Form.Item label={t('??????????????????')}>
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
                              message: t('????????????????????????'),
                            },
                          ]}
                        >
                          <Select suffixIcon={<CaretDownOutlined />} placeholder={t('?????????????????????')}>
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
                              message: t('???????????????'),
                            },
                          ]}
                        >
                          <Input placeholder={t('????????????')} />
                        </Form.Item>
                        <MinusCircleOutlined className='control-icon-normal' onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <PlusCircleOutlined className='control-icon-normal' onClick={() => add()} />
                  </>
                )}
              </Form.List>
            </Form.Item>

            <Form.Item>
              <Button type='primary' onClick={handleSubmit}>
                {t('????????????')}
              </Button>
            </Form.Item>
          </Col>
          <Col span={4}>
            <div className='avatar'>
              <img src={profile.portrait || '/image/avatar1.png'} />
              <Button type='primary' className='update-avatar' onClick={() => setIsModalVisible(true)}>
                {t('????????????')}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
      <Modal title={t('????????????')} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} wrapClassName='avatar-modal'>
        <div className='avatar-content'>
          {avatarList.map((i) => {
            return (
              <div key={i} className={`/image/avatar${i}.png` === selectAvatar ? 'avatar active' : 'avatar'} onClick={() => handleImgClick(i)}>
                <img src={`/image/avatar${i}.png`} />
              </div>
            );
          })}
        </div>
        <Input addonBefore={<span>{t('??????URL')}:</span>} onChange={(e) => setCustomAvatar(e.target.value)} value={customAvatar} />
      </Modal>
    </>
  );
}
