import styled from 'styled-components';
import { markdownStyles, MARKDOWN_TYPE } from 'utils/markdown';

export const Container = styled<{ type: MARKDOWN_TYPE }, 'div'>('div')`
  .mde-preview .mde-preview-content {
    font-size: 1.1rem;
    ${markdownStyles};
  }

  ${p =>
    p.type === MARKDOWN_TYPE.REDUCED &&
    `
    .mde-preview .mde-preview-content {
      font-size: 0.9rem;
    }

    .react-mde,
    .mde-header {
      border-color: rgba(0, 0, 0, 0.12);
    }

    .mde-header {
      font-size: 0.8rem;
      background: none;

      ul.mde-header-group {
        padding: 0.25rem 0.1rem;
        margin-right: 0.75rem;
      }
    }

    .react-mde-tabbed-layout .mde-tabs .mde-tab {
      padding: 0.25rem 0.1rem;
      margin-right: 0;
    }

    .mde-text .public-DraftEditor-content,
    .mde-preview {
      min-height: 100px;
    }
  `};
`;
