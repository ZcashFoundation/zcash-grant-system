import styled from 'styled-components';

export const Info = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  overflow: hidden;
`;

export const InfoLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 300;
  opacity: 0.8;
  letter-spacing: 0.1rem;
  flex: 0 0 auto;
  margin-right: 1rem;
`;

export const InfoValue = styled.div`
  font-size: 1.1rem;
  flex-basis: 0;
  flex-grow: 1;
  overflow: hidden;
  text-align: right;
`;

export const Bar = styled.div`
  position: relative;
  height: 14px;
  background: #eaeaea;
  border-radius: 0.5rem;
  margin: 1rem 0;
`;

export const BarInner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: #1890ff;
  border-radius: 0.5rem;
`;

export const Button = styled.a`
  display: block;
  width: 100%;
  height: 3rem;
  line-height: 3rem;
  padding: 0 0.25rem;
  font-size: 1.2rem;
  text-align: center;
  background: #1890ff;
  border-radius: 4px;
  transition: opacity 100ms ease;

  &,
  &:hover,
  &[disabled] {
    color: #fff;
  }

  &:hover {
    opacity: 0.9;
  }
`;

export const FundingOverMessage = styled<{ isSuccess: boolean }, 'div'>('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem -1rem 0;
  font-size: 1.15rem;
  color: ${p => (p.isSuccess ? '#2ECC71' : '#E74C3C')};

  .anticon {
    font-size: 1.5rem;
    margin-right: 0.4rem;
  }
`;
