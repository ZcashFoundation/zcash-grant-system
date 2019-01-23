import React from 'react';
import { Icon } from 'antd';
import './index.less';

interface Props {
  inline?: boolean;
  size?: string;
  tip?: string;
}

const Loader: React.SFC<Props> = ({ inline, size, tip }) => (
  <div
    className="Loader"
    style={{
      fontSize: size,
      position: inline ? undefined : 'absolute',
      top: inline ? undefined : '50%',
      left: inline ? undefined : '50%',
      transform: inline ? undefined : 'translate(-50%, -50%)',
    }}
  >
    <Icon type="loading" theme="outlined" />
    {tip && <div className="Loader-tip">{tip}</div>}
  </div>
);

export default Loader;
