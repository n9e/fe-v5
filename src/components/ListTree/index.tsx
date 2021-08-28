import React, { ReactNode, useEffect, useState } from 'react';
import {
  Dropdown,
  Form,
  Input,
  Menu,
  message,
  Modal,
  Select,
  Spin,
  Tree,
} from 'antd';
import Item from 'antd/lib/list/Item';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classnames from 'classnames';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { favoriteType } from '@/store/common';
import { useTranslation } from 'react-i18next';
import {
  addResourceGroup,
  getFavoritesResourceGroups,
  getResourceAllGroups,
} from '@/services';
import './index.less';
const { Option } = Select;

interface Item {
  key: string;
  title: string;
  children: Item[];
}
interface TreeProps {
  treeType: string;
  query: string;
  isretry: any;
}
interface currentData {
  title: string;
  key: string;
  children: currentData[];
  id: string;
  isFavorite: boolean;
  icon: ReactNode;
}
const ResourceTree: React.FC<TreeProps> = ({ treeType, isretry, query }) => {
  const [paths, setPaths] = useState<Item[]>([]);
  const [retry, setRetry] = useState(false);
  const [spinning, setSpinning] = useState<boolean>(false);
  const dispatch = useDispatch();
  useEffect(() => {
    setSpinning(true);
    Promise.all([
      getFavoritesResourceGroups(),
      getResourceAllGroups(2000, 1, query),
    ]).then((e) => {
      let isFavoriteArr = e[0].dat;
      let All = e[1].dat.list;
      All = All.map((ele) => {
        let flag = false;
        isFavoriteArr.forEach((element) => {
          if (element.id == ele.id) {
            flag = true;
          }
        });
        if (flag) {
          ele.isFavorite = true;
        } else {
          ele.isFavorite = false;
        }
        return ele;
      });
      let paths = All.map((ele) => {
        return { path: ele.path, id: ele.id, isFavorite: ele.isFavorite };
      });
      paths = generateTree(paths);
      setPaths(paths);
      setTreeData(All);
    });
  }, [retry, query, isretry]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [curData, setCurData] = useState<currentData | undefined>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const history = useHistory();
  const { t, i18n } = useTranslation(); // 新增策略分组
  const [form] = Form.useForm();
  const [treeData, setTreeData] = useState<currentData[] | undefined>();

  function generateTree(arr): Item[] {
    arr.sort();
    var longestCommonPrefix = function (strs: string | any[]) {
      //第一个元素是待匹配元素
      if (strs.length == 0 || strs[0].length == 0) {
        return null;
      }
      if (strs.length == 1) {
        return strs[0];
      }
      let len;
      let strkey;
      let strLen = strs.length;
      for (let i = 1; i < strLen; i++) {
        len = strs[i].key.length;
        strkey = strs[i].key;
        if (strs[0].substring(0, len) == strkey) {
          return strkey;
        }
      }
      return null;
    };
    function toTree(arr) {
      if (!arr.length) {
        return [];
      }
      let heapTree: any[] = [];
      arr.forEach((origin) => {
        let curNodes = heapTree; //指针层 每次从第一层找
        let perLen = 0;
        let objVal;
        let obj: Item | undefined;
        let curStr;
        //这一步找前缀方法实现
        while (true) {
          //寻找待匹配字符和当前层的最大前缀元素
          objVal = longestCommonPrefix([origin.path, ...curNodes]);
          //找到对应节点
          obj = curNodes.find((item: Item) => item.key == objVal);
          //不存在则构建这个节点并且放入这个层
          if (!obj) {
            curStr = perLen ? origin.path.slice(perLen) : origin.path;
            curStr = curStr.replace(/^[\.|\_|\/]{1}/, '');
            curNodes.push({
              title: curStr,
              key: origin.path,
              children: [],
              id: origin.id,
              isFavorite: origin.isFavorite,
              icon: origin.isFavorite ? (
                <StarFilled
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite({
                      id: origin.id,
                      isFavorite: origin.isFavorite,
                    });
                  }}
                  className={classnames(
                    'left-tree-item-icon',
                    'left-tree-item-icon-active',
                  )}
                ></StarFilled>
              ) : (
                <StarOutlined
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite({
                      id: origin.id,
                      isFavorite: origin.isFavorite,
                    });
                  }}
                  className='left-tree-item-icon'
                ></StarOutlined>
              ),
            });
            break;
          }
          perLen = obj.key.length;
          // 存在则指针指向这个节点的children层
          curNodes = obj.children;
        }
      });
      return heapTree;
    }
    let res = toTree(arr);
    setSpinning(false);
    return res;
  }

  const handleFavorite = (e) => {
    dispatch({
      type: `${treeType}/changeGroupFavorite`,
      id: e.id,
      favorType: e.isFavorite ? favoriteType.Delete : favoriteType.Add,
    });
    setRetry(!retry);
  };
  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    history.push({
      pathname: `/${treeType}/${info.node.id}`,
    });
    let item = treeData?.find((ele) => ele.id === info.node.id);
    dispatch({
      type: `${treeType}/chooseGroupItem`,
      data: item,
    });
  };
  const handleOk = () => {
    form.validateFields().then((e) => {
      let formVal = form.getFieldsValue();
      let obj = {
        path: formVal.parentStr + formVal.des + formVal.sonStr,
        node: formVal.note,
      };
      addResourceGroup(obj).then((e) => {
        if (!e.err) {
          message.success('新建成功');
          handleCancel();
          setRetry(!retry);
        }
      });
    });
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setCurData(undefined);
  };

  return (
    <>
      <Spin
        spinning={spinning}
        wrapperClassName={'Spin'}
        style={{ marginTop: 150 }}
      >
        <Tree
          className={'mytree'}
          showIcon
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          onSelect={onSelect}
          treeData={paths}
          blockNode={true}
          titleRender={(nodeData: currentData) => {
            return (
              <>
                <Dropdown
                  trigger={['contextMenu']}
                  placement='bottomLeft'
                  overlay={(function () {
                    return (
                      <Menu>
                        <Menu.Item
                          onClick={(e) => {
                            setCurData(() => {
                              form.setFieldsValue({ parentStr: nodeData.key });
                              return nodeData;
                            });
                            e.domEvent.stopPropagation();
                            setTimeout(() => {
                              setIsModalVisible(true);
                            }, 1);
                          }}
                        >
                          <a>{t('新建子节点')}</a>
                        </Menu.Item>
                      </Menu>
                    );
                  })()}
                >
                  <span>{nodeData.title}</span>
                </Dropdown>
              </>
            );
          }}
        />
      </Spin>
      <Modal
        title={t('新建资源分组')}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout={'vertical'}
          validateTrigger={['onChange', 'trigger', 'onBlur', 'submit']}
        >
          <Form.Item
            name={'path'}
            key={'path'}
            label={t('资源分组路径')}
            wrapperCol={{
              span: 24,
            }}
          >
            <Input.Group
              compact
              className={'compacts'}
              style={{ display: 'flex' }}
            >
              <Form.Item name={['parentStr']}>
                <Input disabled />
              </Form.Item>
              <Form.Item name={'des'} initialValue='_'>
                <Select style={{ width: '50px', margin: '0 5px' }}>
                  <Option value='/'>/</Option>
                  <Option value='.'>.</Option>
                  <Option value='_'>_</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name={['sonStr']}
                style={{ flex: 1 }}
                rules={[
                  { required: true, message: t('资源分组路径必填') },
                  {
                    pattern: /^[^\.|\_|\/]+$/g,
                    message: t('资源分组路径含有非法字符'),
                  },
                ]}
              >
                <Input placeholder={t('资源分组路径')} />
              </Form.Item>
            </Input.Group>
          </Form.Item>
          <Form.Item
            wrapperCol={{
              span: 24,
            }}
            name={'note'}
            key={'note'}
            label={t('资源分组备注')}
          >
            <Input></Input>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ResourceTree;
