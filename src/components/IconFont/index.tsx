import { createFromIconfontCN } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const IconFont = createFromIconfontCN({
  scriptUrl: '/font/iconfont.js',
}); // console.log('{process.env.PUBLIC_URL}=', process.env.PUBLIC_URL)

export default IconFont;
