import React from 'react';
import Link from 'next/link';
import * as Styled from './styled';

export default () => (
  <Styled.Footer>
    <Link href="/">
      <Styled.Title>Grant.io</Styled.Title>
    </Link>
    {/*<Styled.Links>
      <Styled.Link>about</Styled.Link>
      <Styled.Link>legal</Styled.Link>
      <Styled.Link>privacy policy</Styled.Link>
    </Styled.Links>*/}
  </Styled.Footer>
);
