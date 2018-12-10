import React from 'react';
import defaultUserImg from 'static/images/default-user.jpg';

interface Props {
  address?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default class Identicon extends React.PureComponent<Props> {
  render() {
    const { className } = this.props;
    const blockie = defaultUserImg;
    const style = {
      display: 'block',
      ...(this.props.style || {}),
    };

    return <img className={className} style={style} src={blockie} />;
  }
}
