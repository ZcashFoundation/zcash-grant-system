import styled from 'styled-components';
import moneyBg from 'static/images/money.jpg';

export const Hero = styled.div`
  position: relative;
  height: 100vh;
  min-height: 480px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #273c75;
  background-image: url('${moneyBg}');
  background-position: top center;
  background-size: cover;
  box-shadow: 0 80px 50px -40px rgba(0, 0, 0, 0.4) inset;

  @media (max-width: 600px) {
    box-shadow: 0 70px 40px -30px rgba(0, 0, 0, 0.2) inset;
  }
`;

export const HeroTitle = styled.h1`
  color: #fff;
  font-size: 3.4rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  letter-spacing: 0.06rem;
  text-align: center;
  margin-bottom: 2rem;
`;

export const HeroButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 600px) {
    flex-direction: column;
    width: 100%;
  }
`;

export const HeroButton = styled.a`
  height: 3.6rem;
  line-height: 3.6rem;
  width: 16rem;
  padding: 0;
  margin: 0 10px;
  background: ${(p: any) =>
    p.isPrimary
      ? 'linear-gradient(-180deg, #3498DB 0%, #2C8ACA 100%)'
      : 'linear-gradient(-180deg, #FFFFFF 0%, #FAFAFA 98%)'};
  color: ${(p: any) => (p.isPrimary ? '#FFF' : '#4C4C4C')};
  text-align: center;
  font-size: 1.4rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  transition: transform 200ms ease, box-shadow 200ms ease;

  &:hover,
  &:focus {
    transform: translateY(-2px);
    color: ${(p: any) => (p.isPrimary ? '#FFF' : '#4C4C4C')};
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: translateY(0px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 600px) {
    width: 100%;
    max-width: 250px;
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const HeroScroll = styled.button`
  position: absolute;
  bottom: 15px;
  left: 50%;
  background: none;
  padding: 0;
  transform: translateX(-50%);
  color: #fff;
  text-align: center;
  font-size: 1.2rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  transition: transform 200ms ease, opacity 200ms ease;
  cursor: pointer;
  opacity: 0.9;
  font-weight: 300;
  letter-spacing: 0.2rem;

  .anticon {
    display: block;
  }

  &:hover {
    opacity: 1;
    transform: translateX(-50%) translateY(3px);
  }
`;

export const Intro = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  box-shadow: 0 30px 30px -30px rgba(0, 0, 0, 0.3) inset,
    0 -30px 30px -30px rgba(0, 0, 0, 0.3) inset;
`;

export const IntroText = styled.h3`
  max-width: 760px;
  font-size: 1.7rem;
  margin: 0 auto 4rem;
  font-weight: normal;
`;

export const IntroBlobs = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 960px;
  margin: 0 auto;

  @media (max-width: 800px) {
    flex-direction: column;
  }
`;

export const IntroBlob = styled.div`
  margin: 0 1.5rem;

  @media (max-width: 800px) {
    margin: 0 auto;
    margin-bottom: 3rem;
    max-width: 320px;
  }

  img {
    margin-bottom: 1rem;
    opacity: 0.75;
    height: 100px;
  }

  p {
    font-size: 1rem;

    @media (max-width: 800px) {
      font-size: 1.4rem;
    }
  }
`;

export const Features = styled.div`
  background: #4c4c4c;
  color: #fff;
  padding: 7rem 2rem;
`;

export const Feature = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  max-width: 920px;
  margin: 0 auto 10rem;

  &:nth-child(odd) {
    flex-direction: row-reverse;
  }

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 1000px) {
    flex-direction: column !important;
    margin-bottom: 5rem;
  }

  .image {
    width: 100%;
    max-width: 400px;
    background: #666;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);

    &:before {
      content: '';
      display: block;
      padding-top: 60%;
    }

    @media (max-width: 1000px) {
      max-width: 480px;
      margin-bottom: 2rem;
    }
  }

  .info {
    flex: 1;
    max-width: 480px;

    &-title {
      color: inherit;
      font-size: 2.2rem;
      font-weight: normal;
    }

    &-text {
      font-size: 1.1rem;
    }
  }
`;

export const Final = styled.div`
  background: #fff;
  height: 40vh;
  min-height: 480px;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 30px 30px -30px rgba(0, 0, 0, 0.3) inset,
    0 -30px 30px -30px rgba(0, 0, 0, 0.3) inset;
`;

export const FinalText = styled.h4`
  color: inherit;
  font-size: 3rem;
  text-align: center;
`;
