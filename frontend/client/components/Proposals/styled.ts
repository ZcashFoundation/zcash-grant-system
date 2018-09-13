import styled from 'styled-components';
import { Button } from 'antd';

const smallQuery = '@media (max-width: 640px)';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

export const Filters = styled.div`
  width: 220px;
  margin-right: 3rem;

  ${smallQuery} {
    display: none;
  }
`;

export const Results = styled.div`
  flex: 1;
  width: 100%;
`;

export const Search = styled.div`
  display: flex;
`;

// Typescript throws errors if we don't cast as Button.
export const SearchFilterButton: typeof Button = styled(Button)`
  display: none;
  margin-left: 0.5rem;

  ${smallQuery} {
    display: block;
  }
` as any;
