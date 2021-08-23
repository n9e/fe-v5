import React from 'react';
import ResourceTable from './tables/resourceTable';
import PortTable from './tables/portTable';
import ServiceTable from './tables/serviceTable';
import PluginTable from './tables/pluginTable';
import LogTable from './tables/logTable';
import {
  collect_type,
  logData,
  pluginData,
  porcData,
  portData,
  prefixType,
  procMethod,
  protocolType,
  resourceGroupItem,
  resourceItem,
} from '@/store/businessInterface';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { IBaseDrawerProps } from '@/components/BaseDrawer';
import ResourceDetail from './details/resourceDetail';
import Explorer from '@/pages/metric/explorer';
import FormButton, {
  IFormButtonModalProps,
} from '@/components/BaseModal/formButtonModal';
import {
  CopyOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import RangeDatePicker, {
  RangeDatePickerData,
} from '@/components/FormComponents/RangeDatePicker';
import KeyValueInput from '@/components/FormComponents/KeyValueInput';
import type { collectItem } from '@/store/businessInterface';
import {
  Button,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Radio,
  Modal,
  Tooltip,
  Row,
  Col,
  Checkbox,
  Descriptions,
} from 'antd';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/lib/table';
import {
  createCollectSetting,
  updateResourceMute,
  deleteCollectSetting,
  updateCollectSetting,
  regCheck,
  addResourceGroup,
  updateResourceGroup,
  addGroupResource,
  cloneCollectSetting,
  updateResourceDetailNote,
  updateResourceDetailTags,
} from '@/services/resource';
import { OptionProps } from 'antd/lib/select';
import { copyToClipBoard } from '@/utils';
import { useTranslation } from 'react-i18next';
const { confirm } = Modal;
const { TextArea } = Input;
const { Option } = Select;
interface resourceTabProps {
  key: string;
  title: string;
  component: React.FC<any>;
  prefix?: boolean;
}

type tTransLation = (value: string) => string;

const formItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const collectSteps = [15, 30, 60, 90, 120, 300, 600, 1800, 3600];

const ThresholdInput = ({ onChange = () => {}, value = 0 }) => {
  const { t } = useTranslation();
  return (
    <>
      <InputNumber
        style={{
          width: 150,
        }}
        min={1}
        onChange={onChange}
        value={value}
      />{' '}
      {t('秒')}
    </>
  );
};

const ThresholdCollectSelect = ({ onChange = () => {}, value = '' }) => {
  const { t } = useTranslation();
  return (
    <>
      <Select
        style={{
          width: 150,
        }}
        onChange={onChange}
        value={value}
      >
        {collectSteps.map((collectItem) => (
          <Option key={collectItem} value={collectItem}>
            {collectItem}
          </Option>
        ))}
      </Select>{' '}
      {t('秒')}
    </>
  );
};

const handleTagsChange = (value: string[], t: tTransLation) => {
  let top: string = value[value.length - 1];
  let reg = /\w+=\w+/;

  if (top && !reg.test(top)) {
    let v = value.pop();
    message.error(`"${v}${t('"不符合输入规范（格式为key=value）')}`);
  }
};

const formatOptions: OptionProps[] = [
  {
    value: 'dd/mmm/yyyy:HH:MM:SS',
    label: '01/Jan/2006 15:04:05',
    children: null,
  },
  {
    value: 'dd/mmm/yyyy HH:MM:SS',
    label: '01/Jan/2006:15:04:05',
    children: null,
  },
  {
    value: 'yyyy-mm-ddTHH:MM:SS',
    label: '2006-01-02T15:04:05',
    children: null,
  },
  {
    value: 'dd-mmm-yyyy HH:MM:SS',
    label: '01-Jan-2006 15:04:05',
    children: null,
  },
  {
    value: 'yyyy-mm-dd HH:MM:SS',
    label: '2006-01-02 15:04:05',
    children: null,
  },
  {
    value: 'yyyy/mm/dd HH:MM:SS',
    label: '2006/01/02 15:04:05',
    children: null,
  },
  {
    value: 'yyyymmdd HH:MM:SS',
    label: '20060102 15:04:05',
    children: null,
  },
  {
    value: 'mmm dd HH:MM:SS',
    label: 'Jan 2 15:04:05',
    children: null,
  },
  {
    value: 'mmdd HH:MM:SS',
    label: '0102 15:04:05',
    children: null,
  },
  {
    value: 'dd mmm yyyy HH:MM:SS',
    label: '02 Jan 2006 15:04:05',
    children: null,
  },
];
export const tableTabs = (t: tTransLation): resourceTabProps[] => {
  return [
    {
      key: 'resource',
      title: t('资源'),
      component: ResourceTable,
    },
    {
      key: 'explorer',
      title: t('看图'),
      component: Explorer,
    },
    {
      key: 'port',
      title: t('端口'),
      component: PortTable,
    },
    {
      key: 'service',
      title: t('进程'),
      component: ServiceTable,
    },
    {
      key: 'plugin',
      title: t('插件'),
      component: PluginTable,
    },
    {
      key: 'log',
      title: t('日志'),
      component: LogTable,
    }, // {
    //   key: 'component',
    //   title: '组件',
    //   component: ComponentTable,
    // },
  ];
};
export const getCollectColumns = (
  { classpath_name }: Partial<collectItem>,
  refresh: Function,
  type: collect_type,
  t: tTransLation,
): ColumnsType<collectItem> => {
  const mapCollectSecondType = new Map<collect_type, string>([
    ['port', t('端口号')],
    ['process', t('进程标识')],
    ['script', t('插件路径')],
    ['log', t('日志路径')],
  ]);
  const data = [
    {
      title: t('采集名称'),
      dataIndex: 'name',
      render: (data, record) => {
        return (
          <FormButton
            {...(mapCollectFirstFunc.get(type) as Function)(
              t,
              { ...record, type, classpath_name },
              refresh,
              false,
            )}
          ></FormButton>
        );
      },
    },
    {
      title: mapCollectSecondType.get(type),
      dataIndex: 'data',
      render: (data, record) => {
        let targetData;

        try {
          targetData = JSON.parse(data);
        } catch (error) {
          targetData = {};
        }

        switch (type) {
          case 'port': {
            return <>{targetData?.port}</>;
          }

          case 'process': {
            return <>{targetData?.param}</>;
          }

          case 'script': {
            return <>{targetData?.path}</>;
          }

          case 'log': {
            return <>{targetData?.file_path}</>;
          }
        }
      },
    },
    {
      title: t('采集频率'),
      dataIndex: 'step',
      render: (data, record) => {
        return <>{record.step}s</>;
      },
    },
    {
      title: t('备注'),
      dataIndex: 'note',
      render: (text) => {
        return <>{text || ''}</>;
      },
    },
    {
      title: t('修改人'),
      dataIndex: 'update_by',
    },
    {
      title: t('修改时间'),
      dataIndex: 'update_at',
      render: (data) => {
        return <>{dayjs(data * 1000).format('YYYY-MM-DD HH:mm:ss')}</>;
      },
    },
    {
      title: t('操作'),
      dataIndex: 'operator',
      render: (data, record) => {
        return (
          <div className={'table-operator-area'}>
            <FormButton
              {...(mapCollectFirstFunc.get(type) as Function)(
                t,
                { ...record, type, classpath_name },
                refresh,
                true,
                true,
              )}
            ></FormButton>
            <div
              className={'table-operator-area-warning'}
              onClick={() => {
                confirm({
                  title: t('是否删除该采集策略?'),
                  onOk: () => {
                    deleteCollectSetting([record.id]).then(() => {
                      message.success(t('删除成功'));
                      refresh && refresh();
                    });
                  },

                  onCancel() {},
                });
              }}
            >
              {t('删除')}
            </div>
          </div>
        );
      },
    },
  ]; // 当type是日志(log)时, 删除采集频率项

  if (type === 'log') {
    data.splice(2, 1);
  }

  return data;
};
export const createAddResourceModal = (
  ids,
  refresh,
  t,
): IFormButtonModalProps => {
  return {
    customizeButton: (
      <Button type='primary' onClick={() => {}}>
        {t('挂载资源')}
      </Button>
    ),
    modalName: t('挂载资源'),
    handlePromiseOk: addGroupResource as any,
    beforePromiseOk: (values: { data: string }) => {
      return {
        data: values.data.split('\n'),
        id: ids[0],
      };
    },
    afterPromiseOk: (data, values, dispatch) => {
      refresh();
    },
    formLayout: 'vertical',
    children: (form) => (
      <>
        <Form form={form} layout={'vertical'} preserve={false}>
          <Form.Item
            name='data'
            label={t('资源标识')}
            rules={[
              {
                required: true,
                message: t('请输入资源标识'),
              },
            ]}
          >
            <TextArea placeholder={t('请输入资源标识，每行一个')}></TextArea>
          </Form.Item>
        </Form>
      </>
    ),
  };
};
export const getResourceDetailDrawerProps: (
  params: {
    record: resourceItem;
    ref: any;
    dispatch;
  },
  t: tTransLation,
) => IBaseDrawerProps<resourceItem, any, any> = (
  { record, dispatch, ref },
  t,
) => {
  return {
    title: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <span>{record.ident}</span>
        <CopyOutlined
          style={{
            marginLeft: 8,
            cursor: 'pointer',
          }}
          onClick={() => {
            copyToClipBoard(record.ident, t);
          }}
        />
      </div>
    ),
    payload: {
      dispatch,
      data: record,
    },
    renderTrigger: ({ open, payload: { dispatch } }) => {
      return (
        <span
          style={{
            cursor: 'pointer',
            color: '#1473ff',
            marginRight: 16,
          }}
          onClick={() => {
            dispatch({
              type: 'resource/getResourceItem',
              id: record.id,
            });
            open();
          }}
        >
          {record.ident}
        </span>
      );
    },
    footer: '',
    renderContent: () => {
      return <ResourceDetail refs={ref}></ResourceDetail>;
    },
    onConfirm: () => {
      (ref?.current as any)?.refreshList();
      return Promise.resolve();
    },
    width: 900,
  };
};
export const createResourceGroupModal = (
  t: tTransLation,
  data?: Partial<resourceGroupItem>,
  isCreate = true,
): IFormButtonModalProps => {
  return {
    modalName: isCreate ? t('新建') + t('classpath.single') : t('编辑资源分组'),
    customizeButton: isCreate ? (
      <a type='primary'>{t('新建资源分组')}</a>
    ) : (
      <EditOutlined
        title={t('刷新')}
        style={{
          marginLeft: '8px',
          fontSize: '14px',
        }}
      ></EditOutlined>
    ),
    handlePromiseOk: isCreate ? addResourceGroup : updateResourceGroup,
    afterPromiseOk: (data, values, dispatch) => {
      dispatch({
        type: 'resource/getGroup',
        sign: 'refresh',
      });
    },
    setFields: async (form) => {
      if (!isCreate) {
        form.setFieldsValue({ ...data });
      }
    },
    children: (
      <>
        <Form.Item
          name={'path'}
          key={'path'}
          label={t('资源分组路径')}
          wrapperCol={{
            span: 24,
          }}
          rules={[
            {
              required: true,
              message: t('资源分组路径必填'),
            },
          ]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          wrapperCol={{
            span: 24,
          }}
          name={'note'}
          key={t('备注')}
          label={t('资源分组备注')}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item name={'id'} key={'id'} noStyle></Form.Item>
      </>
    ),
  };
};
export const createProcModal = (
  t: tTransLation,
  data?: Partial<collectItem>,
  refresh?: Function,
  isCreate = true,
  isCreateInTable = false,
): IFormButtonModalProps => {
  return {
    customizeButton: isCreate ? (
      !isCreateInTable ? (
        <Button type='primary'>{t('创建进程采集')}</Button>
      ) : (
        <div className='table-operator-area-normal'>{t('克隆')}</div>
      )
    ) : (
      <div className={'table-active-text'}>{data?.name}</div>
    ),
    modalName: isCreate ? t('创建进程采集') : t('进程采集详情'),
    handlePromiseOk: isCreate ? createCollectSetting : updateCollectSetting,
    formLayout: 'horizontal',
    setFields: async (form) => {
      if (!isCreate || isCreateInTable) {
        let optionData;

        try {
          optionData = JSON.parse(data?.data || '{}');
        } catch (error) {
          optionData = {};
        }

        form.setFieldsValue({
          ...data,
          method: (optionData as porcData)?.method || procMethod.CmdLine,
          param: (optionData as porcData)?.param || 0,
          append_tags:
            data?.append_tags == ''
              ? []
              : (data?.append_tags as string).split(' '),
          prefix_match: data?.prefix_match === prefixType.Need || false,
        });
      } else {
        form.setFieldsValue({ ...data });
      }
    },
    beforePromiseOk: (values: collectItem & porcData) => {
      values.data = JSON.stringify({
        method: values.method,
        param: values.param,
      });
      values.append_tags = (
        (values?.append_tags as string[]) || ([] as Array<string>)
      ).join(' ');
      values.prefix_match = values.prefix_match
        ? prefixType.Need
        : prefixType.UnNeed;
      return values;
    },
    modalProps: {
      width: 800,
    },
    afterPromiseOk: () => {
      refresh && refresh();
      message.success(
        `${isCreate ? t('创建') : t('更新')}${t('采集规则成功')}`,
      );
    },
    children: (form) => (
      <>
        <Form.Item label={t('进程监控指标')} key='intric'>
          <div>proc_num</div>
        </Form.Item>
        <Form.Item
          label={t('所属资源分组')}
          rules={[
            {
              required: true,
              message: t('资源分组必填'),
            },
          ]}
          name='classpath_id'
          key='classpath_id'
        >
          <div>{data?.classpath_name || ''}</div>
        </Form.Item>
        <Form.Item
          valuePropName='checked'
          label={t('前缀匹配')}
          name='prefix_match'
          key='prefix_match'
        >
          <Checkbox></Checkbox>
        </Form.Item>
        <Form.Item
          label={t('采集名称')}
          rules={[
            {
              required: true,
              message: t('采集名称必填'),
            },
          ]}
          name='name'
          key='name'
        >
          <Input placeholder={t('请输入采集配置的名称')}></Input>
        </Form.Item>
        <Form.Item
          label={t('采集方式')}
          rules={[
            {
              required: true,
              message: t('采集方式必填'),
            },
          ]}
          name='method'
          key='method'
          initialValue={procMethod.CmdLine}
        >
          <Radio.Group buttonStyle='solid'>
            <Radio.Button value={procMethod.CmdLine}>
              {t('命令行')}
            </Radio.Button>
            <Radio.Button value={procMethod.Name}>{t('进程名')}</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate
          style={{
            marginBottom: 0,
          }}
        >
          {() => {
            return (
              <Form.Item
                {...formItemLayout}
                name='param'
                key='param'
                rules={[
                  {
                    required: true,
                    message: t('该项必填'),
                  },
                ]}
                label={
                  form.getFieldsValue().method === 'cmdline'
                    ? t('命令行')
                    : t('进程名')
                }
              >
                <Input
                  placeholder={
                    form.getFieldsValue().method === 'cmdline'
                      ? t(
                          '取 /proc/$pid/cmdline 中的部分子串，可以唯一标识进程即可',
                        )
                      : t('取  /proc/$pid/status 中 name 的值')
                  }
                ></Input>
              </Form.Item>
            );
          }}
        </Form.Item>
        <Form.Item
          label={t('采集频率')}
          rules={[
            {
              required: true,
              message: t('采集频率必填'),
            },
          ]}
          name='step'
          key='step'
          initialValue={15}
        >
          <ThresholdCollectSelect></ThresholdCollectSelect>
        </Form.Item>
        <Form.Item
          label={t('附加标签')}
          style={{
            marginTop: 20,
          }}
          name='append_tags'
        >
          <Select
            mode='tags'
            onChange={(value) => handleTagsChange(value as string[], t)}
            placeholder={t('格式为key=value回车分隔')}
            dropdownStyle={{
              display: 'none',
            }}
          ></Select>
        </Form.Item>
        <Form.Item label={t('备注')} name='note' key='note'>
          <Input></Input>
        </Form.Item>
        <Form.Item noStyle name='type' key='type'></Form.Item>
        <Form.Item noStyle name='id' key='id'></Form.Item>
      </>
    ),
  };
};
export const createPortModal = (
  t: tTransLation,
  data?: Partial<collectItem>,
  refresh?: Function,
  isCreate = true,
  isCreateInTable = false,
): IFormButtonModalProps => {
  return {
    customizeButton: isCreate ? (
      !isCreateInTable ? (
        <Button type='primary'>{t('创建端口采集')}</Button>
      ) : (
        <div className='table-operator-area-normal'>{t('克隆')}</div>
      )
    ) : (
      <div className={'table-active-text'}>{data?.name}</div>
    ),
    modalName: isCreate ? t('创建端口采集') : t('端口采集详情'),
    handlePromiseOk: isCreate ? createCollectSetting : updateCollectSetting,
    formLayout: 'horizontal',
    setFields: async (form) => {
      if (!isCreate || isCreateInTable) {
        let optionData;

        try {
          optionData = JSON.parse(data?.data || '{}');
        } catch (error) {
          optionData = {};
        }

        form.setFieldsValue({
          ...data,
          port: (optionData as portData)?.port || 0,
          timeout: (optionData as portData)?.timeout,
          protocol: (optionData as portData)?.protocol || protocolType.TCP,
          append_tags:
            data?.append_tags == ''
              ? []
              : (data?.append_tags as string).split(' '),
          prefix_match: data?.prefix_match === prefixType.Need || false,
        });
      } else {
        form.setFieldsValue({ ...data });
      }
    },
    beforePromiseOk: (values: collectItem & portData) => {
      values.data = JSON.stringify({
        port: values.port,
        protocol: values.protocol,
        timeout: values.timeout,
      });
      values.append_tags = (
        (values?.append_tags as string[]) || ([] as Array<string>)
      ).join(' ');
      values.prefix_match = values.prefix_match
        ? prefixType.Need
        : prefixType.UnNeed;
      return values;
    },
    afterPromiseOk: () => {
      refresh && refresh();
      message.success(
        `${isCreate ? t('创建') : t('更新')}${t('采集规则成功')}`,
      );
    },
    modalProps: {
      width: 800,
    },
    children: (
      <>
        <Form.Item label={t('端口监控指标')} key='intric'>
          <div>proc_port_listen</div>
        </Form.Item>
        <Form.Item
          label={t('所属资源分组')}
          rules={[
            {
              required: true,
              message: t('资源分组必填'),
            },
          ]}
          name='classpath_id'
          key='classpath_id'
        >
          <div>{data?.classpath_name || ''}</div>
        </Form.Item>
        <Form.Item
          valuePropName='checked'
          label={t('前缀匹配')}
          name='prefix_match'
          key='prefix_match'
        >
          <Checkbox></Checkbox>
        </Form.Item>
        <Form.Item
          label={t('采集名称')}
          rules={[
            {
              required: true,
              message: t('采集名称必填'),
            },
          ]}
          name='name'
          key='name'
        >
          <Input placeholder={t('请输入采集配置的名称')}></Input>
        </Form.Item>
        <Form.Item
          label={t('端口协议')}
          rules={[
            {
              required: true,
              message: t('端口协议必填'),
            },
          ]}
          name='protocol'
          key='protocol'
          initialValue={protocolType.TCP}
        >
          <Radio.Group buttonStyle='solid'>
            <Radio.Button value={protocolType.TCP}>TCP</Radio.Button>
            <Radio.Button value={protocolType.UDP}>UDP</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={t('端口号')}
          rules={[
            {
              required: true,
              message: t('端口号必填'),
            },
          ]}
          name='port'
          key='port'
        >
          <InputNumber
            style={{
              width: 150,
            }}
            placeholder={t('请输入端口号')}
          ></InputNumber>
        </Form.Item>
        <Form.Item
          label={t('连接超时')}
          rules={[
            {
              required: true,
              message: t('连接超时必填'),
            },
          ]}
          initialValue={10}
          name='timeout'
          key='timeout'
        >
          <ThresholdInput />
        </Form.Item>
        <Form.Item
          label={t('采集频率')}
          rules={[
            {
              required: true,
              message: t('采集频率必填'),
            },
          ]}
          initialValue={15}
          name='step'
          key='step'
        >
          <ThresholdCollectSelect></ThresholdCollectSelect>
        </Form.Item>
        <Form.Item
          label={t('附加标签')}
          style={{
            marginTop: 20,
          }}
          name='append_tags'
        >
          <Select
            mode='tags'
            onChange={(value) => handleTagsChange(value as string[], t)}
            placeholder={t('格式为key=value回车分隔')}
          ></Select>
        </Form.Item>
        <Form.Item label={t('备注')} name='note' key='note'>
          <Input></Input>
        </Form.Item>
        <Form.Item noStyle name='type' key='type'></Form.Item>
        <Form.Item noStyle name='id' key='id'></Form.Item>
      </>
    ),
  };
};
export const createPluginModal = (
  t: tTransLation,
  data?: Partial<collectItem>,
  refresh?: Function,
  isCreate = true,
  isCreateInTable = false,
): IFormButtonModalProps => {
  return {
    customizeButton: isCreate ? (
      !isCreateInTable ? (
        <Button type='primary'>{t('创建插件采集')}</Button>
      ) : (
        <div className='table-operator-area-normal'>{t('克隆')}</div>
      )
    ) : (
      <div className={'table-active-text'}>{data?.name}</div>
    ),
    modalName: isCreate ? t('创建插件采集') : t('插件采集详情'),
    handlePromiseOk: isCreate ? createCollectSetting : updateCollectSetting,
    formLayout: 'horizontal',
    setFields: async (form) => {
      if (!isCreate || isCreateInTable) {
        console.log(data, 'setFields');

        let optionData;

        try {
          optionData = JSON.parse(data?.data || '{}');
          console.log(optionData);
        } catch (error) {
          optionData = {};
        }
        if (optionData.env) {
          form.setFieldsValue({
            env: (optionData as pluginData)?.env,
          });
        }
        form.setFieldsValue({
          ...data,
          timeout: (optionData as pluginData)?.timeout || '',
          path: (optionData as pluginData)?.path || '',
          params: (optionData as pluginData)?.params || '',
          stdin: (optionData as pluginData)?.stdin || '',
          // env: (optionData as pluginData)?.env || '',
          prefix_match: data?.prefix_match === prefixType.Need || false,
        });
      } else {
        form.setFieldsValue({ ...data });
      }
    },
    beforePromiseOk: (values: collectItem & pluginData) => {
      values.data = JSON.stringify({
        path: values.path,
        params: values.params,
        stdin: values.stdin,
        env: values.env,
        timeout: values.timeout,
      });
      values.prefix_match = values.prefix_match
        ? prefixType.Need
        : prefixType.UnNeed;
      return values;
    },
    modalProps: {
      width: 800,
    },
    afterPromiseOk: () => {
      refresh && refresh();
      message.success(
        `${isCreate ? t('创建') : t('更新')}${t('插件采集成功')}`,
      );
    },
    children: (
      <>
        <Form.Item
          label={t('所属资源分组')}
          rules={[
            {
              required: true,
              message: t('资源分组必填'),
            },
          ]}
          name='classpath_id'
          key='classpath_id'
        >
          <div>{data?.classpath_name || ''}</div>
        </Form.Item>
        <Form.Item
          valuePropName='checked'
          label={t('前缀匹配')}
          name='prefix_match'
          key='prefix_match'
        >
          <Checkbox></Checkbox>
        </Form.Item>
        <Form.Item
          label={t('采集名称')}
          rules={[
            {
              required: true,
              message: t('采集名称必填'),
            },
          ]}
          name='name'
          key='name'
        >
          <Input placeholder={t('请输入采集配置的名称')}></Input>
        </Form.Item>
        <Form.Item
          label={t('插件路径')}
          rules={[
            {
              required: true,
              message: t('插件路径必填'),
            },
          ]}
          name='path'
          key='path'
        >
          <Input placeholder={t('插件路径')}></Input>
        </Form.Item>
        <Form.Item label={t('参数')} name='params' key='params'>
          <Input placeholder={t('请输入参数')}></Input>
        </Form.Item>
        <Form.Item label={t('环境变量')} name='env' key='env'>
          <KeyValueInput
            placeText={t('变量')}
            isKeyValue={false}
          ></KeyValueInput>
        </Form.Item>
        <Form.Item label={t('标准输入(Stdin)')} name='stdin' key='stdin'>
          <TextArea></TextArea>
        </Form.Item>
        <Form.Item
          label={t('执行超时')}
          rules={[
            {
              required: true,
              message: t('连接超时必填'),
            },
          ]}
          initialValue={15}
          name='timeout'
          key='timeout'
        >
          <ThresholdInput />
        </Form.Item>
        <Form.Item
          label={t('采集频率')}
          rules={[
            {
              required: true,
              message: t('采集频率必填'),
            },
          ]}
          initialValue={60}
          name='step'
          key='step'
        >
          <ThresholdCollectSelect></ThresholdCollectSelect>
        </Form.Item>
        <Form.Item label={t('备注')} name='note' key='note'>
          <Input></Input>
        </Form.Item>
        <Form.Item noStyle name='type' key='type'></Form.Item>
        <Form.Item noStyle name='id' key='id'></Form.Item>
      </>
    ),
  };
};
export const createLogModal = (
  t: tTransLation,
  data: Partial<collectItem>,
  refresh?: Function,
  isCreate = true,
  isCreateInTable = false,
): IFormButtonModalProps => {
  const funcTypes = [
    {
      value: 'count',
      key: 'count',
      label: t('count(对符合规则的日志进行计数)'),
      children: null,
    },
    {
      value: 'histogram',
      key: 'histogram',
      label: t('histogram(对符合规则的日志抓取出的数字计算统计值)'),
      children: null,
    },
  ];
  return {
    customizeButton: isCreate ? (
      !isCreateInTable ? (
        <Button type='primary'>{t('创建日志采集')}</Button>
      ) : (
        <div className='table-operator-area-normal'>{t('克隆')}</div>
      )
    ) : (
      <div className={'table-active-text'}>{data?.name}</div>
    ),
    modalProps: {
      width: 800,
    },
    modalName: isCreate ? t('创建日志采集') : t('日志采集详情'),
    handlePromiseOk: isCreate ? createCollectSetting : updateCollectSetting,
    formLayout: 'horizontal',
    setFields: async (form) => {
      let str;
      if (data.name) {
        str = data?.name?.slice(4);
        // data.name = str;
      }

      if (!isCreate || isCreateInTable) {
        let optionData;

        try {
          optionData = JSON.parse(data?.data || '{}');
        } catch (error) {
          optionData = {};
        }

        form.setFieldsValue({
          ...data,
          name: str,
          file_path: (optionData as logData)?.file_path || '',
          func: (optionData as logData)?.func || '',
          pattern: (optionData as logData)?.pattern || '',
          tags_pattern: (optionData as logData)?.tags_pattern || {},
          append_tags:
            data?.append_tags == ''
              ? []
              : (data?.append_tags as string).split(' '),
          prefix_match: data?.prefix_match === prefixType.Need || false,
        });
      } else {
        // if (data.name) {
        //   let str  = data?.name?.slice(4)
        //   data.name = str
        // }
        form.setFieldsValue({ ...data });
      }
    },
    beforePromiseOk: (values: collectItem & logData) => {
      values.data = JSON.stringify({
        file_path: values.file_path,
        func: values.func,
        pattern: values.pattern,
        tags_pattern: values.tags_pattern,
      });
      values.append_tags = (
        (values?.append_tags as string[]) || ([] as Array<string>)
      ).join(' ');
      values.prefix_match = values.prefix_match
        ? prefixType.Need
        : prefixType.UnNeed;
      values.name = 'log_' + values.name;
      return values;
    },
    afterPromiseOk: () => {
      refresh && refresh();
      message.success(
        `${isCreate ? t('创建') : t('更新')}${t('采集规则成功')}`,
      );
    },
    children: (form) => (
      <>
        <Row>
          <Col span={23}>
            <Form.Item
              label={t('所属资源分组')}
              rules={[
                {
                  required: true,
                  message: t('资源分组必填'),
                },
              ]}
              name='classpath_id'
              key='classpath_id'
            >
              <div>{data?.classpath_name || ''}</div>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={23}>
            <Form.Item
              valuePropName='checked'
              label={t('前缀匹配')}
              name='prefix_match'
              key='prefix_match'
            >
              <Checkbox></Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={23}>
            <Form.Item
              label={t('指标名称')}
              rules={[
                {
                  required: true,
                  message: t('指标名称必填'),
                },
              ]}
              name='name'
              key='name'
            >
              <Input
                addonBefore='log_'
                placeholder={t('请输入采集配置的名称')}
              ></Input>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={23}>
            <Form.Item
              label={t('计算方法')}
              rules={[
                {
                  required: true,
                  message: t('计算方法必填'),
                },
              ]}
              name='func'
              key='func'
            >
              <Select
                placeholder={funcTypes[0].label}
                options={funcTypes}
              ></Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={23}>
            <Form.Item
              label={t('日志路径')}
              rules={[
                {
                  required: true,
                  message: t('日志路径必填'),
                },
              ]}
              name='file_path'
              key='file_path'
            >
              <Input placeholder={t('请输入日志路径，支持*通配符')}></Input>
            </Form.Item>
          </Col>
          <Col
            style={{
              lineHeight: '32px',
            }}
            className={'tooltip-col'}
          >
            {/* <Tooltip
              placement='top'
              title={t(
                '日志末尾自带时间格式，例如 /path/access.log.${%Y%m%d%H}${} 中不能包含 /',
              )}
            >
              <InfoCircleOutlined
                className={'detail-tooltipIcon'}
              ></InfoCircleOutlined>
            </Tooltip> */}
          </Col>
        </Row>
        <Row>
          <Col span={23}>
            <Form.Item
              label={t('匹配正则')}
              name='pattern'
              key='pattern'
              rules={[
                {
                  required: true,
                  message: t('匹配正则必填'),
                },
              ]}
            >
              <Input
                placeholder={t(
                  '请输入正则表达式匹配日志关键字，histogram会提取第一个括号内的值',
                )}
              ></Input>
            </Form.Item>
          </Col>
          <Col
            className={'tooltip-col'}
            style={{
              lineHeight: '32px',
            }}
          >
            {/* <Tooltip
              placement='top'
              title={t(
                '耗时计算：中的数值会用于计算曲线值流量计数：每匹配到该正则，曲线值+1',
              )}
            >
              <InfoCircleOutlined
                className={'detail-tooltipIcon'}
              ></InfoCircleOutlined>
            </Tooltip> */}
          </Col>
        </Row>
        <Row>
          <Col span={23}>
            <Form.Item label={t('标签')} name='tags_pattern' key='tags_pattern'>
              <KeyValueInput
                isKeyValue={false}
                placeText={t('标签')}
              ></KeyValueInput>
            </Form.Item>
          </Col>
          <Col
            style={{
              lineHeight: '32px',
            }}
            className={'tooltip-col'}
          >
            {/* <Tooltip
              placement='top'
              title={`${t(
                'tagName 填写说明\\r\\n\n              1. 不允许包含host、trigger、include\n              2. 不允许包含如下4个特殊字符\n              tagValue 填写说明\n              1.必须包含括号。括号中的正则内容被用作tagValue的取值，必须可枚举。\n              2.不允许包含如下4个特殊字符=,:@',
              )}`}
            >
              <InfoCircleOutlined
                className={'detail-tooltipIcon'}
              ></InfoCircleOutlined>
            </Tooltip> */}
          </Col>
        </Row>
        <Row>
          <Col span={23}>
            <Form.Item label={t('验证')} name='valiate' key='valiate'>
              <Input placeholder={t('请输入一行待监控的完整日志')}></Input>
            </Form.Item>
          </Col>
        </Row>
        <Row
          style={{
            marginTop: '-12px',
            marginBottom: '12px',
            marginRight: '30px',
          }}
        >
          <Col offset={6}>
            <Button
              onClick={() => {
                const values: collectItem &
                  logData & {
                    valiate?: string;
                  } = form.getFieldsValue();

                regCheck({
                  ...values.tags_pattern,
                  func: values.func || '',
                  re: values.pattern || '',
                  log: values.valiate || '',
                }).then((res) => {
                  const { dat, success: regFlag } = res;

                  if (regFlag) {
                    const { success, tags } = dat;
                    confirm({
                      icon: success ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: 'red' }} />
                      ),
                      zIndex: 2001,
                      title: `${t('验证')}${success ? t('通过') : t('失败')}`,
                      content: (
                        <div>
                          <Form>
                            {tags.map((tagItem, index) => (
                              <Form.Item label={Object.keys(tagItem)[0]}>
                                {tagItem[Object.keys(tagItem)[0]]}
                              </Form.Item>
                            ))}
                          </Form>
                        </div>
                      ),
                      okText: t('确定'),
                      cancelText: t('取消'),
                    });
                  }
                });
              }}
            >
              {t('验证')}
            </Button>
          </Col>
        </Row>
        <Row>
          <Col span={23}>
            <Form.Item
              label={t('附加标签')}
              style={{
                marginTop: 20,
              }}
              name='append_tags'
            >
              <Select
                mode='tags'
                onChange={(value) => handleTagsChange(value as string[], t)}
                placeholder={t('格式为key=value回车分隔')}
              ></Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={23}>
            <Form.Item label={t('备注')} name='note' key='note'>
              <Input></Input>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item noStyle name='type' key='type'></Form.Item>
        <Form.Item noStyle name='id' key='id'></Form.Item>
      </>
    ),
  };
};
export const mapCollectFirstFunc = new Map<collect_type, Function>([
  ['port', createPortModal],
  ['process', createProcModal],
  ['script', createPluginModal],
  ['log', createLogModal],
]);
export const getRangeDatePickerModal: (
  data: RangeDatePickerData,
  ids: Array<number>,
  refresh: Function,
  t: tTransLation,
  customizeButton?: React.ReactNode,
) => IFormButtonModalProps = (data, ids, refresh, t, customizeButton) => {
  return {
    muteTimePromiseOK: () => {
      return updateResourceMute({
        ids,
        btime: 0,
        etime: 0,
      });
    },
    customizeButton: (
      <div>{customizeButton ? customizeButton : t('屏蔽时间')}</div>
    ),
    modalName: t('屏蔽时间'),
    handlePromiseOk: ({ pickerData }: { pickerData: RangeDatePickerData }) => {
      return updateResourceMute({
        ids,
        ...pickerData,
      });
    },
    afterPromiseOk: () => {
      refresh && refresh();
    },
    setFields: async (form) => {
      form.setFieldsValue({
        pickerData: {
          btime: data.btime,
          etime: data.etime,
        },
      });
    },
    modalProps: {
      width: 700,
    },
    children: (
      <>
        <Form.Item
          label={t('选择时间')}
          name='pickerData'
          wrapperCol={{ span: 24 }}
        >
          <RangeDatePicker value={data}></RangeDatePicker>
        </Form.Item>
      </>
    ),
  };
};
export const cloneResourceModal = (
  selectRows,
  resourceList: any[],
  t: tTransLation,
): IFormButtonModalProps => {
  return {
    customizeButton: (
      <a
        style={{
          marginRight: 8,
          color: '#000',
        }}
        type='primary'
        onClick={() => {}}
      >
        {t('克隆到其他资源分组')}
      </a>
    ),
    modalName: t('选择资源分组'),
    handlePromiseOk: (e: { classpath_ids: []; res_idents: Object[] }) => {
      let cloneData: any = [];
      e.classpath_ids.forEach((ids) => {
        e.res_idents.forEach((ele: { classpath_id: Number }) => {
          ele.classpath_id = ids;
          cloneData.push(JSON.parse(JSON.stringify(ele)));
        });
      });
      return cloneCollectSetting(cloneData);
    },
    afterPromiseOk: (e) => {
      message.success(t('克隆成功'));
    },
    formLayout: 'vertical',
    setFields: async (form) => {
      form.setFieldsValue({
        ['res_idents']: selectRows,
      });
    },
    children: (form) => (
      <>
        <Form form={form} layout={'vertical'} preserve={false}>
          <Form.Item
            name='classpath_ids'
            label={t('资源分组')}
            rules={[
              {
                required: true,
                message: t('分组不可为空'),
              },
            ]}
          >
            <Select mode='multiple' allowClear size='middle'>
              {resourceList.map((groupItem: resourceGroupItem) => (
                <Option
                  key={groupItem.id}
                  title={groupItem.path}
                  value={groupItem.id}
                >
                  {groupItem.path}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name='res_idents'></Form.Item>
        </Form>
      </>
    ),
  };
};

export const batchUpdateRemarkModal: (
  ids: Array<number>,
  refresh: Function,
  t: tTransLation,
) => IFormButtonModalProps = (ids, refresh, t) => {
  return {
    customizeButton: <div>{t('修改备注')}</div>,
    modalName: t('修改备注'),
    handlePromiseOk: ({ note }: { note: string }) => {
      return updateResourceDetailNote({
        ids,
        note,
      });
    },
    afterPromiseOk: () => {
      refresh && refresh();
    },
    setFields: async (form) => {},
    modalProps: {
      width: 700,
    },
    children: (
      <>
        <Form.Item label={t('备注')} name='note' wrapperCol={{ span: 24 }}>
          <Input></Input>
        </Form.Item>
      </>
    ),
  };
};

export const batchUpdateTagsModal: (
  tags: string[],
  ids: Array<number>,
  refresh: Function,
  t: tTransLation,
) => IFormButtonModalProps = (tags, ids, refresh, t) => {
  return {
    customizeButton: <div>{t('修改标签')}</div>,
    modalName: t('修改标签'),
    handlePromiseOk: ({ tags }: { tags: string[] }) => {
      return updateResourceDetailTags({
        ids,
        tags: tags.join(' '),
      });
    },
    afterPromiseOk: () => {
      refresh && refresh();
    },
    setFields: async (form) => {
      form.setFieldsValue({ tags: tags });
    },
    modalProps: {
      width: 700,
    },
    children: (
      <>
        <Form.Item label={t('标签')} name='tags' wrapperCol={{ span: 24 }}>
          <Select
            mode='tags'
            placeholder={t('格式为key=value回车分隔')}
            dropdownStyle={{
              display: 'none',
            }}
          ></Select>
        </Form.Item>
      </>
    ),
  };
};
