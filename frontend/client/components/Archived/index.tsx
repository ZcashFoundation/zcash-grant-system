import React from 'react';
import { ProposalDetail } from 'components/Proposal';
import Exception from 'components/ExceptionPage';
import Loader from 'components/Loader';
import { makeProposalPreviewFromArchived } from 'modules/create/utils';
import { STATUS, Proposal } from 'types';
import { getProposal } from 'api/api';
import './index.less';

interface Props {
  proposalId: number;
}

interface State {
  proposal?: Proposal;
  errorCode?: '403' | '404' | '500';
  loading: boolean;
}

export class ArchivedProposal extends React.Component<Props, State> {
  state: State = {
    loading: false,
  };

  async componentWillMount() {
    const { proposalId } = this.props;
    const { proposal } = this.state;

    if (!proposal || proposal.proposalId !== proposalId) {
      this.setState({ loading: true, errorCode: undefined });
      try {
        const { data } = await getProposal(proposalId);
        this.setState({ proposal: data });
      } catch (e) {
        this.setState({ errorCode: '404' });
      }
      this.setState({ loading: false });
    }
  }

  render() {
    const { proposalId } = this.props;
    const { proposal, errorCode } = this.state;
    const wrongProposal = proposal && proposal.proposalId !== this.props.proposalId;
    const badProposal = proposal && !wrongProposal && proposal.status !== STATUS.ARCHIVED;

    if (errorCode || badProposal) {
      return <Exception code={errorCode || '404'} desc="Proposal not found" />;
    }

    if (!proposal || wrongProposal) {
      return <Loader size="large" />;
    }

    const proposalDetail = makeProposalPreviewFromArchived(proposal);
    return (
      <div className="Archived">
        <ProposalDetail
          user={null}
          proposalId={proposalId}
          fetchProposal={(() => null) as any}
          updateProposal={(() => null) as any}
          detail={proposalDetail}
          isFetchingDetail={false}
          detailError={null}
          history={(() => null) as any}
          location={(() => null) as any}
          match={(() => null) as any}
          isPreview
        />
      </div>
    );
  }
}

export default ArchivedProposal;
