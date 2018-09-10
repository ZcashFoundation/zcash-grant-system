import React from 'react';
import makeBlockie from 'ethereum-blockies-base64';
import defaultUserImg from 'static/images/default-user.jpg';

interface Props {
  address?: string;
  style?: React.CSSProperties;
}

export default class Identicon extends React.PureComponent<Props> {
  render() {
    const blockie = this.props.address ? makeBlockie(this.props.address) : defaultUserImg;
    const style = {
      display: 'block',
      ...(this.props.style || {}),
    };

    return <img style={style} src={blockie} />;
  }
}
