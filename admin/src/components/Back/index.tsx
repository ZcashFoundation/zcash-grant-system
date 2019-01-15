import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import './index.less';

interface Props {
  to: string;
  text: string;
}

const Back: React.SFC<Props> = p => (
  <h1 className="Back">
    <Link to={p.to}>
      <Icon type="arrow-left" />
    </Link>
    {p.text}
  </h1>
);

export default Back;
