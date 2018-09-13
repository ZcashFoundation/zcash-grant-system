import styled from 'styled-components';
import { markdownStyles } from 'utils/markdown';

export const Container = styled.div`
  .mde-preview .mde-preview-content {
    font-size: 1.1rem;
    ${markdownStyles};
  }
`;
