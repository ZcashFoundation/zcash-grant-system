import React from 'react';
import { Link } from 'react-router-dom';
import * as Styled from './styled';

export default () => (
  <Styled.Footer>
    <Styled.Title>
      <Link to="/">Grant.io</Link>
    </Styled.Title>
    {/*<Styled.Links>
      <Styled.Link>about</Styled.Link>
      <Styled.Link>legal</Styled.Link>
      <Styled.Link>privacy policy</Styled.Link>
    </Styled.Links>*/}
  </Styled.Footer>
);
