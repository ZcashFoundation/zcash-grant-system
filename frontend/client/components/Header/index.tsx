import React from 'react';
import { Icon } from 'antd';
import Link from 'next/link';
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
          <div style={{ display: 'flex' }}>
            <Link href="/proposals">
              <Styled.Button>
                <Styled.ButtonIcon>
                  <Icon type="shop" />
                </Styled.ButtonIcon>
                <Styled.ButtonText>Explore</Styled.ButtonText>
              </Styled.Button>
            </Link>
          </div>

          <Link href="/">
            <Styled.Title>Grant.io</Styled.Title>
          </Link>

          <React.Fragment>
            <Link href="/create">
              <Styled.Button style={{ marginLeft: '1.5rem' }}>
                <Styled.ButtonIcon>
                  <Icon type="form" />
                </Styled.ButtonIcon>
                <Styled.ButtonText>Start a Proposal</Styled.ButtonText>
              </Styled.Button>
            </Link>
          </React.Fragment>

          {!isTransparent && <Styled.AlphaBanner>Alpha</Styled.AlphaBanner>}
        </Styled.Header>
      </React.Fragment>
    );
  }
}
