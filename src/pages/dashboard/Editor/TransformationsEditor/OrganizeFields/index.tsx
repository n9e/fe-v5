import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import OrganizeFields from './OrganizeFields';

export default function index({ chartForm }) {
  return (
    <Form.List
      name='transformations'
      initialValue={[
        {
          id: 'organize',
          options: {},
        },
      ]}
    >
      {(fields) => {
        return (
          <>
            {_.map(fields, (field) => {
              return <OrganizeFields key={field.key} />;
            })}
          </>
        );
      }}
    </Form.List>
  );
}
