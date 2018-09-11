import styled from 'styled-components';

const collapseWidth = '1100px';
const singleColWidth = '600px';

export const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

export const Top = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 2rem;

  @media (max-width: ${collapseWidth}) {
    flex-direction: column;
  }
`;

export const TopMain = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 19rem);
  margin-right: 1.5rem;

  @media (max-width: ${collapseWidth}) {
    width: 100%;
  }
`;

export const TopSide = styled.div`
  width: 19rem;
  display: flex;
  flex-direction: column;
  flex-align: flex-start;

  @media (max-width: ${collapseWidth}) {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;

    > * {
      flex: 1;
    }

    > *:first-child {
      margin-right: 1rem;
    }
  }

  @media (max-width: ${singleColWidth}) {
    flex-direction: column;

    > *:first-child {
      margin-right: 0;
    }
  }
`;

export const PageTitle = styled.h1`
  font-size: 2rem;
  line-height: 3rem;
  margin-bottom: 0.75rem;
  margin-left: 0.5rem;

  @media (min-width: ${collapseWidth}) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  @media (max-width: ${collapseWidth}) {
    font-size: 1.8rem;
  }

  @media (max-width: ${singleColWidth}) {
    font-size: 1.6rem;
  }
`;

export const BlockTitle = styled.h3`
  font-size: 1.5rem;
  line-height: 2.2rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  margin-left: 0.5rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const Block = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1), 0 1px 1px rgba(0, 0, 0, 0.1);
`;

export const SideBlock = styled.div`
  display: flex;
  flex-direction: column;

  > *:last-child {
    flex: 1;
  }
`;

export const BodyText = styled.div<{ isExpanded: boolean }>`
  max-height: ${(p: any) => (p.isExpanded ? 'none' : '27rem')};
  overflow: hidden;
  font-size: 1.1rem;

  h1 {
    font-size: 2rem;
  }
  h2 {
    font-size: 1.8rem;
  }
  h3 {
    font-size: 1.6rem;
  }
  h4 {
    font-size: 1.4rem;
  }
  h5 {
    font-size: 1.2rem;
  }
  h6 {
    font-size: 1.1rem;
  }

  ul,
  ol {
    padding-left: 30px;
    font-size: 1.05rem;
  }

  ul {
    list-style: circle;
  }

  ol {
    list-style: decimal;
  }

  img {
    max-width: 100%;
  }
`;

export const BodyExpand = styled.button`
  display: block;
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 0;
  height: 120px;
  border-radius: 4px;
  line-height: 160px;
  text-align: center;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 1),
    rgba(255, 255, 255, 1)
  );
  outline: none;
  color: rgb(74, 144, 226, 0.8);
  cursor: pointer;
  transition: color 100ms ease;

  &:hover {
    color: rgb(74, 144, 226, 1);
  }
`;
