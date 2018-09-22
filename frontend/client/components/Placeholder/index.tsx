import React from 'react';
import './style.less';

interface Props {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  style?: React.CSSProperties;
}

const Placeholder: React.SFC<Props> = ({ style = {}, title, subtitle }) => (
  <div className="Placeholder" style={style}>
    {title && <h3 className="Placeholder-title">{title}</h3>}
    {subtitle && <div className="Placeholder-subtitle">{subtitle}</div>}
  </div>
);

export default Placeholder;
