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

interface Props extends ProposalWithCrowdFund {
  web3: any;
}

class ProposalCard extends React.Component<Props> {
  render() {
    const { title, proposalId, category, dateCreated, web3, crowdFund } = this.props;
    const team = [...this.props.team].reverse();

    if (!web3) {
      return <Spin />;
    } else {
      const percent = Math.floor((crowdFund.funded / crowdFund.target) * 100);
      return (
        <Link href={`/proposals/${proposalId}`}>
          <Styled.Container>
            <Styled.Title>{title}</Styled.Title>
            <Styled.Funding>
              <Styled.FundingRaised>
                {crowdFund.funded} ETH <small>raised</small> of {crowdFund.target} ETH
                goal
              </Styled.FundingRaised>
              <Styled.FundingPercent isFunded={percent >= 100}>
                {percent}%
              </Styled.FundingPercent>
            </Styled.Funding>
            <Progress
              percent={percent}
              showInfo={false}
              status={percent >= 100 ? 'success' : 'active'}
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
