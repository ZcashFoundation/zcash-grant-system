import React from 'react';
import { Popover, Icon } from 'antd';
import './index.less';
import { PopoverProps } from 'antd/lib/popover';

const Info: React.SFC<PopoverProps> = p => (
  <span className="Info">
    <Popover overlayClassName="Info-overlay" {...p}>
      {p.children} <Icon type="question-circle" />
    </Popover>
  </span>
);

export default Info;
