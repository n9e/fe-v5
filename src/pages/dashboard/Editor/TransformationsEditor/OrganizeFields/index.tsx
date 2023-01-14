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
              return (
                <div key={field.key}>
                  <Form.Item {...field} name={[field.name, 'id']} hidden />
                  <Form.Item {...field} name={[field.name, 'options']}>
                    <OrganizeFields />
                  </Form.Item>
                </div>
              );
            })}
          </>
        );
      }}
    </Form.List>
  );
}
