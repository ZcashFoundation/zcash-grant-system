import styled from 'styled-components';

export const Container = styled.div`
  border: 1px solid #eee;
  padding: 1rem 1rem 0;
  border-radius: 2px;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition-property: border-color, box-shadow, transform;
  transition-duration: 100ms;
  transition-timing-function: ease;

  &:hover,
  &:focus {
    border: 1px solid #ccc;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    transform: translateY(-2px);
  }
`;

export const Title = styled.h3`
  display: -webkit-box;
  font-size: 1rem;
  line-height: 1.3rem;
  height: 2.6rem;
  margin-bottom: 1rem;
  text-overflow: ellipsis;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const Team = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.75rem 0;
`;

export const TeamName = styled.div`
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  small {
    opacity: 0.6;
    font-size: 0.6rem;
    font-weight: 500;
  }
`;

export const TeamAvatars = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-left: 1.25rem;

  img {
    width: 1.5rem;
    height: 1.5rem;
    margin-left: -0.75rem;
    border-radius: 100%;
  }
`;

export const Funding = styled.div`
  display: flex;
  justify-content: space-between;
  line-height: 1.2rem;
`;

export const FundingRaised = styled.div`
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  small {
    opacity: 0.6;
  }
`;

export const FundingPercent = styled<{ isFunded: boolean }, 'div'>('div')`
  color: ${p => (p.isFunded ? '#2ecc71' : 'inherit')};
  font-size: 0.7rem;
  padding-left: 0.25rem;
`;

export const Info = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0.5rem -1rem 0;
  padding: 0.75rem 1rem;
  border-top: 1px solid #eee;
  background: #fafafa;
`;

export const InfoCategory = styled.div`
  border-radius: 4px;
`;

export const InfoCreated = styled.div`
  opacity: 0.6;
`;

export const ContractAddress = styled.div`
  font-size: 0.7rem;
  margin-right: 2.5rem;
  margin-top: -0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.4;
`;
