import React, { ReactNode, useEffect, useState } from 'react';
import {
  Button,
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
import { filter } from './until';
const { Option } = Select;

interface Item {
  originTitle: string;
  id: string;
  key: string;
  title: string;
  children: Item[];
}
interface TreeProps {
  treeHeight: number;
  treeType: string;
  query: string;
  isretry: any;
}
interface currentData {
  originTitle: string;
  title: string;
  key: string;
  children: currentData[];
  id: string;
  isFavorite: boolean;
  icon: ReactNode;
  path: string;
}
interface originType {
  create_at: number;
  create_by: string;
  id: number;
  isFavorite: boolean;
  note: string;
  path: string;
  preset: number;
  update_at: number;
}
const ResourceTree: React.FC<TreeProps> = ({
  treeType,
  isretry, //dispatch会触发isretry，刷新本组件
  query,
  treeHeight,
}) => {
  const [retry, setRetry] = useState(false);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [paths, setPaths] = useState<Item[]>([]); //初始化构建的整颗树
  const [treeData, setTreeData] = useState<currentData[] | undefined>(); //树依赖的数据
  const [dataLoading, setdataLoading] = useState<boolean>(false); //解决树的默认展开异步问题
  const [dispatchTree, setdispatchTree] = useState<originType[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [curData, setCurData] = useState<currentData | undefined>();
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isQuery, setisQuery] = useState(false);
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  // useEffect(() => {
  //   console.log(treeHeight);
  // }, [treeHeight]);
  // useEffect(() => {
  //   console.log(expandedKeys);
  // }, [expandedKeys]);
  useEffect(() => {
    // console.log(query);

    setSpinning(true);
    Promise.all([
      getFavoritesResourceGroups(),
      getResourceAllGroups(2000, 1),
    ]).then((e) => {
      let isFavoriteArr = e[0].dat;
      let All = e[1].dat.list;
      setdispatchTree(All);
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
      }); //patch收藏数组和全部数组
      paths = generateTree(paths); // 初始树
      setPaths(paths);
      if (query) {
        setdataLoading(false);
        const { queryTree, defaultExpandedKeys } = filter(paths, query);
        setTreeData(queryTree); //组件过滤树
        // console.log(defaultExpandedKeys);
        setExpandedKeys(
          Array.from(new Set([...defaultExpandedKeys, ...expandedKeys])), //兼容搜索模式下在子节点下方连续添加
        ); //控制默认展开节点数组
        setisQuery(true);
        setTimeout(() => {
          setdataLoading(true);
        }, 1);
      } else {
        setdataLoading(false);

        if (isQuery) {
          setExpandedKeys([]); //如果从搜索状态恢复，收起所有展开
          setisQuery(false);
        } else {
          setExpandedKeys(expandedKeys); //控制默认展开节点数组,为原始(作用1：model的连续创建)
        }
        setTreeData(paths);
      }
      setTimeout(() => {
        setdataLoading(true); //防止数据未处理完并且为注入tree组件，tree已经渲染
      }, 1);
    });
  }, [retry, isretry, query]);

  //控制展开key
  const onExpand = (expandedKeys, { expanded: bool, node }) => {
    function delSon(node) {
      if (node) {
        node.children &&
          node.children.forEach((ele) => {
            if (expandedKeys.indexOf(ele.key) != -1) {
              expandedKeys.splice(expandedKeys.indexOf(ele.key), 1);
            }
            delSon(ele);
          });
      }
    }
    //关闭所有子元素展开
    delSon(node);
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

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
        len = strs[i].originTitle.length;
        strkey = strs[i].originTitle;
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
          obj = curNodes.find((item: Item) => item.originTitle == objVal);
          //不存在则构建这个节点并且放入这个层
          if (!obj) {
            curStr = perLen ? origin.path.slice(perLen) : origin.path;
            curStr = curStr.replace(/^[\.|\_|\/|\-]{1}/, '');
            curNodes.push({
              title: curStr,
              originTitle: origin.path,
              key: origin.id,
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
          perLen = obj.originTitle.length;
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
  };

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    history.push({
      pathname: `/${treeType}/${info.node.id}`,
    });
    let item = dispatchTree?.find((ele) => ele.id === info.node.id);
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
          message.success(t('创建成功'));
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
    localStorage.removeItem('modalExpandedKey');
  };
  const handleSaveModel = () => {
    form.validateFields().then((e) => {
      let formVal = form.getFieldsValue();
      let obj = {
        path: formVal.parentStr + formVal.des + formVal.sonStr,
        node: formVal.note,
      };
      addResourceGroup(obj).then((e) => {
        if (!e.err) {
          message.success(t('创建成功'));
          setRetry(!retry);
        }
      });
    });
  };

  return (
    <>
      <Spin
        spinning={spinning}
        wrapperClassName={'Spin'}
        style={{ marginTop: 150 }}
      >
        {dataLoading && (
          <Tree
            height={treeHeight}
            // style={{ flex: 1, overflowY: 'hidden' }}
            className={'mytree'}
            showIcon
            onExpand={onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            defaultExpandAll={true}
            onSelect={onSelect}
            treeData={treeData}
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
                                let tempArr = [...expandedKeys];
                                tempArr.push(nodeData.key);
                                setExpandedKeys(tempArr);
                                setAutoExpandParent(false);
                                form.setFieldsValue({
                                  parentStr: nodeData.originTitle,
                                });
                                return nodeData;
                              });
                              // e.domEvent.stopPropagation();
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
        )}
      </Spin>
      <Modal
        title={t('新建资源分组')}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key='back' onClick={handleCancel}>
            {t('取消')}
          </Button>,
          <Button key='link' type='primary' onClick={handleSaveModel}>
            {t('创建')}
          </Button>,
          <Button key='submit' type='primary' onClick={handleOk}>
            {t('创建并关闭')}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout={'vertical'}
          validateTrigger={['onChange', 'onBlur']}
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
              <Form.Item name={'des'} initialValue='-'>
                <Select style={{ width: '50px', margin: '0 5px' }}>
                  <Option value='/'>/</Option>
                  <Option value='.'>.</Option>
                  <Option value='_'>_</Option>
                  <Option value='-'>-</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name={['sonStr']}
                style={{ flex: 1 }}
                rules={[
                  { required: true, message: t('资源分组路径必填') },
                  {
                    pattern: /^[^\.|\_|\/|\-]+$/g,
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
