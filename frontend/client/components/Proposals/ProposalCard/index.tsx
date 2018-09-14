import React from 'react';
import { Progress, Icon, Spin } from 'antd';
import moment from 'moment';
import Link from 'next/link';
import { CATEGORY_UI } from 'api/constants';
import { ProposalWithCrowdFund } from 'modules/proposals/reducers';
import * as Styled from './styled';
import { Dispatch, bindActionCreators } from 'redux';
import * as web3Actions from 'modules/web3/actions';
import { AppState } from 'store/reducers';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Identicon from 'components/Identicon';
import UnitDisplay from 'components/UnitDisplay';

interface Props extends ProposalWithCrowdFund {
  web3: AppState['web3']['web3'];
}

class ProposalCard extends React.Component<Props> {
  render() {
    const { title, proposalId, category, dateCreated, web3, crowdFund } = this.props;
    const team = [...this.props.team].reverse();

    if (!web3) {
      return <Spin />;
    } else {
      return (
        <Link href={`/proposals/${proposalId}`}>
          <Styled.Container>
            <Styled.Title>{title}</Styled.Title>
            <Styled.Funding>
              <Styled.FundingRaised>
                <UnitDisplay value={crowdFund.funded} symbol="ETH" />{' '}
                <small>raised</small> of{' '}
                <UnitDisplay value={crowdFund.target} symbol="ETH" /> goal
              </Styled.FundingRaised>
              <Styled.FundingPercent isFunded={crowdFund.percentFunded >= 100}>
                {crowdFund.percentFunded}%
              </Styled.FundingPercent>
            </Styled.Funding>
            <Progress
              percent={crowdFund.percentFunded}
              status={crowdFund.percentFunded >= 100 ? 'success' : 'active'}
              showInfo={false}
            />

            <Styled.Team>
              <Styled.TeamName>
                {team[0].accountAddress}{' '}
                {team.length > 1 && <small>+{team.length - 1} other</small>}
              </Styled.TeamName>
              <Styled.TeamAvatars>
                {team.reverse().map(u => (
                  <Identicon key={u.userid} address={u.accountAddress} />
                ))}
              </Styled.TeamAvatars>
            </Styled.Team>
            <Styled.ContractAddress>{proposalId}</Styled.ContractAddress>

            <Styled.Info>
              <Styled.InfoCategory style={{ color: CATEGORY_UI[category].color }}>
                <Icon type={CATEGORY_UI[category].icon} /> {CATEGORY_UI[category].label}
              </Styled.InfoCategory>
              <Styled.InfoCreated>
                {moment(dateCreated * 1000).fromNow()}
              </Styled.InfoCreated>
            </Styled.Info>
          </Styled.Container>
        </Link>
      );
    }
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(web3Actions, dispatch);
}

function mapStateToProps(state: AppState) {
  return {
    web3: state.web3.web3,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(ProposalCard);
