import React from 'react';
import {
  Modal, Input, message,
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import clipboard from './clipboard';

interface Props {
  dataIndex: string,
  data: any[],
  hasSelected?: boolean,
}
type CopyType = 'all' | 'selected' | 'currentPage';
type HandleCopyBtnClick = (dataIndex: string, copyType: CopyType) => void;

const HostCopyTitle = (props: Props) => {
  const { t, i18n } = useTranslation();
  const handleCopyBtnClick: HandleCopyBtnClick = async (dataIndex, copyType) => {
    const { data } = props;
    let tobeCopy = [];

    if (copyType === 'all') {
      tobeCopy = _.map(data, (item) => item[dataIndex]);
    }

    if (_.isEmpty(tobeCopy)) {
      message.warning(t('host.copy.empty'));
      return;
    }

    const tobeCopyStr = _.join(tobeCopy, '\n');
    const copySucceeded = clipboard(tobeCopyStr);

    if (copySucceeded) {
      if (i18n.language === 'zh') {
        message.success(`复制成功${tobeCopy.length}条记录`);
      } else if (i18n.language === 'en') {
        message.success(`Successful copy ${tobeCopy.length} items`);
      }
    } else {
      Modal.warning({
        title: t('host.copy.error'),
        content: <Input.TextArea defaultValue={tobeCopyStr} />,
      });
    }
  }

  const { dataIndex } = props;

  return (
    <span>
      Host
      <CopyOutlined
        className="pointer"
        style={{ paddingLeft: 5 }}
        onClick={() => handleCopyBtnClick(dataIndex, 'all')}
      />
    </span>
  );
}

HostCopyTitle.defaultProps = {
  data: [],
  selected: [],
  hasSelected: true,
};

export default HostCopyTitle;
