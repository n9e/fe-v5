import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Progress, Row, Col, Table, Input, Space } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import _ from 'lodash';
import PageLayout from '@/components/pageLayout';
import { getBrainJobs } from '@/services/warning';
import Graph from './Graph';
import './style.less';

const typeMap = {
  total: {
    border: '#9684C6',
    bg: '#EBE8F2',
    text: '总曲线数',
    title: '所有曲线',
  },
  success: {
    border: '#83D35C',
    bg: '#E8F4E3',
    text: '训练成功',
    title: '训练成功',
    status: 1,
  },
  fail: {
    border: '#EE5A52',
    bg: '#FCE7E6',
    text: '训练失败',
    title: '训练失败',
    status: 2,
  },
  training: {
    border: '#CCCCCC',
    bg: '#F4F4F4',
    text: '训练中',
    title: '训练中',
    status: 0,
  },
};

export default function Jobs() {
  const [data, setData] = useState<any>({});
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [graphParams, setGraphParams] = useState<any>({});
  const [activeType, setActiveType] = useState<string>('total');
  const params: any = useParams();

  useEffect(() => {
    getBrainJobs(params.id).then((res) => {
      setData({
        total: res.total,
        success: res.success,
        fail: res.fail,
        training: res.training,
      });
      setJobs(res.jobs);
    });
  }, [params.id]);

  return (
    <PageLayout title='训练结果' showBack hideCluster>
      <div className='strategy-jobs-content'>
        <div style={{ padding: 16 }}>
          <Row gutter={16}>
            {_.map(data, (value, key) => {
              return (
                <Col key={key} span={6}>
                  <div
                    style={{
                      border: `1px solid ${typeMap[key].border}`,
                      borderRadius: 2,
                      background: typeMap[key].bg,
                      height: 86,
                      display: 'flex',
                      gap: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setActiveType(key);
                    }}
                  >
                    <Progress
                      width={60}
                      type='circle'
                      percent={(value / data.total) * 100}
                      strokeColor={typeMap[key].border}
                      strokeWidth={12}
                      trailColor='#FFFFFF'
                      format={(percent) => {
                        // if (key === 'total') {
                        //   return <div>{percent}</div>;
                        // }
                        // if (key === 'success' || key === 'fail') {
                        //   return (
                        //     <div>
                        //       {percent} / {data.total}
                        //     </div>
                        //   );
                        // }
                        return null;
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 24,
                          color: '#333',
                          fontWeight: 500,
                        }}
                      >
                        {value}
                      </div>
                      <div
                        style={{
                          color: '#666',
                        }}
                      >
                        {typeMap[key].text}
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
          <Table
            style={{ marginTop: 6 }}
            rowKey='uuid'
            showHeader
            title={() => <h3>{typeMap[activeType].title}</h3>}
            dataSource={_.filter(jobs, (item) => {
              if (search) {
                return item.promql.indexOf(search) > -1;
              }
              if (activeType !== 'total') {
                return item.status === typeMap[activeType].status;
              }
              return true;
            })}
            columns={[
              {
                title: (
                  <Space>
                    <span>PromQL</span>
                    <Input
                      size='small'
                      prefix={<SearchOutlined />}
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                    />
                  </Space>
                ),
                dataIndex: 'promql',
                key: 'promql',
              },
              {
                title: '结果',
                dataIndex: 'train_detail',
                key: 'train_detail',
              },
              {
                title: '操作',
                render: (record) => {
                  if (record.status === 2) return null;
                  return (
                    <a
                      onClick={() => {
                        setGraphParams({
                          visible: true,
                          uuid: record.uuid,
                          promql: record.promql,
                        });
                      }}
                    >
                      曲线详情
                    </a>
                  );
                },
              },
            ]}
            locale={{
              emptyText: (
                <div style={{ padding: '20px 0' }}>
                  <LoadingOutlined style={{ fontSize: 24 }} />
                  <div>曲线模型训练中</div>
                </div>
              ),
            }}
          />
        </div>
      </div>
      <Graph
        rid={params.id}
        {...graphParams}
        setVisible={(visible) => {
          setGraphParams({
            ...graphParams,
            visible,
          });
        }}
      />
    </PageLayout>
  );
}
