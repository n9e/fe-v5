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
import { Button, Result } from 'antd';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

const NotFound: React.FC = () => {
  const history = useHistory();
  const [adminList, setAdminList] = useState<string[]>();
  useEffect(() => {
    request(`/api/v1/system/users/amdin`, {
      method: RequestMethod.Get,
    }).then((res) => {
      console.log(res);
      setAdminList(res.data.map((item) => item.username));
    });
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Result
        title='403'
        subTitle={
          <div>
            <div>你没有权限访问该页面, 请联系管理员!</div>
            {adminList && <div>管理员： {adminList.join(', ')}</div>}
          </div>
        }
        extra={
          <Button type='primary' onClick={() => history.go(-2)}>
            返回上一页
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
