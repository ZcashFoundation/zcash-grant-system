import React from 'react';
import * as Styled from './styled';

interface Props {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  style?: React.CSSProperties;
}

const Placeholder: React.SFC<Props> = ({ style = {}, title, subtitle }) => (
  <Styled.Container style={style}>
    {title && <Styled.Title>{title}</Styled.Title>}
    {subtitle && <Styled.Subtitle>{subtitle}</Styled.Subtitle>}
  </Styled.Container>
);

export default Placeholder;
