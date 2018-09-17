import React from 'react';
import { Icon } from 'antd';
import { Link } from 'react-router-dom';
import * as Styled from './styled';

interface OwnProps {
  isTransparent?: boolean;
}

type Props = OwnProps;

export default class Header extends React.Component<Props> {
  render() {
    const { isTransparent } = this.props;
    return (
      <React.Fragment>
        <Styled.Header isTransparent={isTransparent}>
          <Styled.Button style={{ display: 'flex' }}>
            <Link to="/proposals">
              <Styled.ButtonIcon>
                <Icon type="shop" />
              </Styled.ButtonIcon>
              <Styled.ButtonText>Explore</Styled.ButtonText>
            </Link>
          </Styled.Button>

          <Styled.Title>
            <Link to="/">Grant.io</Link>
          </Styled.Title>

          <React.Fragment>
            <Styled.Button style={{ marginLeft: '1.5rem' }}>
              <Link to="/create">
                <Styled.ButtonIcon>
                  <Icon type="form" />
                </Styled.ButtonIcon>
                <Styled.ButtonText>Start a Proposal</Styled.ButtonText>
              </Link>
            </Styled.Button>
          </React.Fragment>

          {!isTransparent && <Styled.AlphaBanner>Alpha</Styled.AlphaBanner>}
        </Styled.Header>
      </React.Fragment>
    );
  }
}
