import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import Markdown from 'components/Markdown';
import { proposalActions } from 'modules/proposals';
import { bindActionCreators, Dispatch } from 'redux';
import { AppState } from 'store/reducers';
import { ProposalWithCrowdFund } from 'modules/proposals/reducers';
import { getProposal } from 'modules/proposals/selectors';
import { Spin, Tabs, Icon } from 'antd';
import CampaignBlock from './CampaignBlock';
import TeamBlock from './TeamBlock';
import Milestones from './Milestones';

import CommentsTab from './Comments';
import UpdatesTab from './Updates';
import GovernanceTab from './Governance';
import ContributorsTab from './Contributors';
// import CommunityTab from './Community';
import * as Styled from './styled';
import { withRouter } from 'react-router';
import Web3Container from 'lib/Web3Container';
import { web3Actions } from 'modules/web3';

interface OwnProps {
  proposalId: string;
}

interface StateProps {
  proposal: ProposalWithCrowdFund;
}

interface DispatchProps {
  fetchProposal: proposalActions.TFetchProposal;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  isBodyExpanded: boolean;
  isBodyOverflowing: boolean;
  bodyId: string;
}

class ProposalDetail extends React.Component<Props, State> {
  state: State = {
    isBodyExpanded: false,
    isBodyOverflowing: false,
    bodyId: `body-${Math.floor(Math.random() * 1000000)}`,
  };

  componentDidMount() {
    if (!this.props.proposal) {
      this.props.fetchProposal(this.props.proposalId);
    }
    window.addEventListener('resize', this.checkBodyOverflow);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkBodyOverflow);
  }

  componentDidUpdate() {
    if (this.props.proposal) {
      this.checkBodyOverflow();
    }
  }

  render() {
    const { proposal } = this.props;
    const { isBodyExpanded, isBodyOverflowing, bodyId } = this.state;
    const showExpand = !isBodyExpanded && isBodyOverflowing;

    if (!proposal) {
      return <Spin />;
    } else {
      const { crowdFund } = proposal;
      return (
        <Styled.Container>
          <Styled.Top>
            <Styled.TopMain>
              <Styled.PageTitle>
                {proposal ? proposal.title : <span>&nbsp;</span>}
              </Styled.PageTitle>
              <Styled.Block style={{ flexGrow: 1 }}>
                <Styled.BodyText id={bodyId} isExpanded={isBodyExpanded}>
                  {proposal ? <Markdown source={proposal.body} /> : <Spin size="large" />}
                </Styled.BodyText>
                {showExpand && (
                  <Styled.BodyExpand onClick={this.expandBody}>
                    Read more <Icon type="arrow-down" style={{ fontSize: '0.7rem' }} />
                  </Styled.BodyExpand>
                )}
              </Styled.Block>
            </Styled.TopMain>
            <Styled.TopSide>
              <CampaignBlock proposal={proposal} />
              <TeamBlock crowdFund={crowdFund} />
            </Styled.TopSide>
          </Styled.Top>

          {proposal && (
            <Tabs>
              <Tabs.TabPane tab="Milestones" key="milestones">
                <div style={{ marginTop: '1.5rem', padding: '0 2rem' }}>
                  <Milestones proposal={proposal} />
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Discussion" key="discussions">
                <div style={{ marginTop: '1.5rem' }} />
                <CommentsTab proposalId={proposal.proposalId} />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Updates" key="updates">
                <div style={{ marginTop: '1.5rem' }} />
                <UpdatesTab proposalId={proposal.proposalId} />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Governance" key="governance">
                <GovernanceTab proposal={proposal} />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Contributors" key="contributors">
                <ContributorsTab crowdFund={proposal.crowdFund} />
              </Tabs.TabPane>
            </Tabs>
          )}
        </Styled.Container>
      );
    }
  }

  private expandBody = () => {
    this.setState({ isBodyExpanded: true });
  };

  private checkBodyOverflow = () => {
    const { isBodyExpanded, bodyId, isBodyOverflowing } = this.state;
    if (isBodyExpanded) {
      return;
    }

    // Use id instead of ref because styled component ref doesn't return html element
    const bodyEl = document.getElementById(bodyId);
    if (!bodyEl) {
      return;
    }

    if (isBodyOverflowing && bodyEl.scrollHeight <= bodyEl.clientHeight) {
      this.setState({ isBodyOverflowing: false });
    } else if (!isBodyOverflowing && bodyEl.scrollHeight > bodyEl.clientHeight) {
      this.setState({ isBodyOverflowing: true });
    }
  };
}

function mapStateToProps(state: AppState, ownProps: OwnProps) {
  return {
    proposal: getProposal(state, ownProps.proposalId),
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators({ ...proposalActions, ...web3Actions }, dispatch);
}

const withConnect = connect<StateProps, DispatchProps, OwnProps, AppState>(
  mapStateToProps,
  mapDispatchToProps,
);

const ConnectedProposal = compose<Props, OwnProps>(
  withRouter,
  withConnect,
)(ProposalDetail);

export default (props: OwnProps) => (
  <Web3Container
    renderLoading={() => (
      <Styled.Container>
        <Styled.Top>
          <Styled.TopMain>
            <Spin />
          </Styled.TopMain>
        </Styled.Top>
      </Styled.Container>
    )}
    render={() => <ConnectedProposal {...props} />}
  />
);
