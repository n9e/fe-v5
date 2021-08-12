import React, { useState, useEffect } from 'react';
import { Table, Row, Col, Input } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { instantquery } from '@/services/overview';
import { indicatorEditDefault } from '@/pages/overview/const';
import { Identifier, IndicatorEditItem, IModalData } from '@/store/overview';
import EditModal from '@/pages/overview/component/editModal';
import * as d3 from 'd3';
import { formatTrim } from '@/utils';
import { useTranslation } from 'react-i18next';

const indicatorEditorLocal: string =
  localStorage.getItem('indicatorEditorUser') || '[]';
const indicatorEditUser: IndicatorEditItem[] =
  JSON.parse(indicatorEditorLocal).length > 0
    ? JSON.parse(indicatorEditorLocal)
    : indicatorEditDefault;

const Indicators: React.FC = () => {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(true);
  const [tableList, setTablelist] = useState<object>({});
  const [indicatorEdit, setIndicatorEdit] =
    useState<IndicatorEditItem[]>(indicatorEditUser);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalData, setModalData] = useState<IModalData>({});

  const columns: ColumnsType<Identifier> = [
    {
      title: 'KEY',
      dataIndex: 'metric',
    },
    {
      title: 'VALUE',
      dataIndex: 'value',
      render: (text: number, row) => {
        const cur = indicatorEdit.find(
          (item) => item.promql === row.promql,
        ) || { warning: 99 };
        const class1 = text > cur.warning ? 'red' : '';
        const formatText = formatTrim(d3.format('.5s')(text));
        return {
          children: <a className={class1}>{formatText}</a>,
        };
      },
      fixed: 'right',
      defaultSortOrder: 'descend',
      sortDirections: ['ascend', 'descend', 'ascend'],
      sorter: {
        compare: (a: Identifier, b: Identifier) => a.value - b.value,
        multiple: 3,
      },
    },
  ];

  const getIndicatorList = async (item1: IndicatorEditItem) => {
    const data = await instantquery({
      prome_ql: item1.promql,
    });
    if (data && data.dat) {
      const list = data.dat;
      const resList = list.map((item, index) => {
        const metricStr = Object.keys(item.metric).reduce(
          (total, currentValue, currentIndex, arr) => {
            let str = currentIndex >= arr.length - 1 ? '' : ',';
            return `${total}${currentValue}=${item.metric[currentValue]}${str}`;
          },
          '',
        );
        const obj = Object.assign(
          {},
          {
            metric: metricStr,
            promql: item1.promql,
            value: item.value[item.value.length - 1],
            key: index,
          },
        );
        return obj;
      });

      if (isMounted) {
        const promql = item1.promql;
        tableList[promql] = resList;
        const tbNew = { ...tableList };
        setTablelist(tbNew);
      }
    }
  };

  useEffect(() => {
    init();
    return () => {
      setIsMounted(false);
    };
  }, []);

  function init() {
    indicatorEdit.forEach((item) => {
      getIndicatorList(item);
    });
  }

  function setClick(item, index) {
    setModalVisible(true);
    const md = Object.assign({}, { index, editData: item });
    setModalData(md);
  }

  function editClose() {
    setModalVisible(false);
  }

  function editOk(data) {
    if (data.index !== undefined) {
      getIndicatorList(data.editData);
      const arr = [...indicatorEdit];
      arr[data.index] = data.editData;
      setIndicatorEdit(arr);
      localStorage.setItem('indicatorEditorUser', JSON.stringify(arr));
    }
  }
  return (
    <div className='part indicator_part'>
      <div className='title'>{t('指标TOP')}</div>
      <div>
        <Row justify='space-between' gutter={18}>
          {indicatorEdit?.map((item, index) => (
            <Col key={index} span={6}>
              <div>
                <Input
                  addonAfter={
                    <SettingOutlined onClick={() => setClick(item, index)} />
                  }
                  value={item?.name}
                />

                <Table
                  columns={columns}
                  size='small'
                  dataSource={tableList[item.promql]}
                  pagination={false}
                />
              </div>
            </Col>
          ))}
        </Row>
      </div>
      <EditModal
        modalVisible={modalVisible}
        modalData={modalData}
        editClose={editClose}
        editOk={editOk}
      ></EditModal>
    </div>
  );
};

export default Indicators;
