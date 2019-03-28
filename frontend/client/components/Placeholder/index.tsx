import React from 'react';
import './style.less';
import Loader from 'components/Loader';

interface Props {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  style?: React.CSSProperties;
  loading?: boolean;
}

const Placeholder: React.SFC<Props> = ({ style = {}, title, subtitle, loading }) => (
  <div className={`Placeholder${(!!loading && ' is-loading') || ''}`} style={style}>
    {(loading && <Loader inline={true} size="small" />) || (
      <>
        {title && <h3 className="Placeholder-title">{title}</h3>}
        {subtitle && <div className="Placeholder-subtitle">{subtitle}</div>}
      </>
    )}
  </div>
);

export default Placeholder;
