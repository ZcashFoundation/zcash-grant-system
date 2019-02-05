import React from 'react';
import { Icon } from 'antd';
import classnames from 'classnames';
import './index.less';

interface Props {
  size?: 'large' | 'small';
  inline?: boolean;
  tip?: string;
  overlay?: boolean;
}

const Loader: React.SFC<Props> = ({ inline, size, tip, overlay }) => (
  <div
    className={classnames(
      'Loader',
      size && `is-${size}`,
      inline && 'is-inline',
      overlay && 'is-overlay',
    )}
  >
    <Icon type="loading" theme="outlined" />
    {tip && <div className="Loader-tip">{tip}</div>}
  </div>
);

export default Loader;
