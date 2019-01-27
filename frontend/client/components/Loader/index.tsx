import React from 'react';
import { Icon } from 'antd';
import classnames from 'classnames';
import './index.less';

interface Props {
  size?: 'large' | 'small';
  inline?: boolean;
  tip?: string;
}

const Loader: React.SFC<Props> = ({ inline, size, tip }) => (
  <div className={classnames('Loader', size && `is-${size}`, inline && 'is-inline')}>
    <Icon type="loading" theme="outlined" />
    {tip && <div className="Loader-tip">{tip}</div>}
  </div>
);

export default Loader;
