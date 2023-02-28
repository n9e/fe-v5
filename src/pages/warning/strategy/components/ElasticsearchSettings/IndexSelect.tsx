import React, { useState, useEffect } from 'react';
import { Form, AutoComplete } from 'antd';
import _ from 'lodash';
import { getIndices } from '@/services/warning';
import { useTranslation } from "react-i18next";
interface IProps {
  prefixField?: any;
  prefixName?: string[];
  cate: string;
  cluster: string[];
  name?: string | string[]; // 可自定义 name 或者 [...prefixName, 'query', 'index']
}

export default function IndexSelect({
  prefixField = {},
  prefixName = [],
  cate,
  cluster,
  name
}: IProps) {
  const {
    t
  } = useTranslation();
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState('');
  useEffect(() => {
    if ((cate === 'elasticsearch' || cate === 'elasticsearch-log') && !_.isEmpty(cluster)) {
      getIndices({
        cate,
        cluster: _.join(cluster, ' ')
      }).then(res => {
        setOptions(_.map(res.dat, item => {
          return {
            value: item
          };
        }));
      });
    }
  }, [cate, _.join(cluster, ' ')]);
  return <Form.Item label={t("索引")} tooltip={<div>
          {t("支持多种配置方式")}
         <br />
          1. {t("指定单个索引")} gb {t("在")} gb {t("索引中搜索所有的文档")}
         <br />
          2. {t("指定多个索引")} gb,us {t("在")} gb {t("和")} us {t("索引中搜索所有的文档")}
         <br />
          3. {t("指定索引前缀")} g*,u* {t("在任何以")} g {t("或者")} u {t("开头的索引中搜索所有的文档")}
         <br />
        </div>} {...prefixField} name={name || [...prefixName, 'query', 'index']} rules={[{
    required: true,
    message: t("请输入索引")
  }]} validateTrigger='onBlur'>
      <AutoComplete options={_.filter(options, item => {
      if (search) {
        return item.value.includes(search);
      }
      return true;
    })} onSearch={val => {
      setSearch(val);
    }} />
    </Form.Item>;
}