import React from 'react';
import { connect } from 'react-redux';
import { Alert } from 'antd';
import { ProposalDetail } from 'components/Proposal';
import { AppState } from 'store/reducers';
import { makeProposalPreviewFromDraft } from 'modules/create/utils';
import { ProposalDraft } from 'types';

interface StateProps {
  form: ProposalDraft;
}

type Props = StateProps;

class CreateFlowPreview extends React.Component<Props> {
  render() {
    const { form } = this.props;
    const proposal = makeProposalPreviewFromDraft(form);
    return (
      <>
        <Alert
          style={{ margin: '-1rem 0 2rem', textAlign: 'center' }}
          message="This is a preview of your proposal. It has not yet been published."
          type="info"
          showIcon={false}
          banner
        />
        <ProposalDetail
          account="0x0"
          proposalId={0}
          fetchProposal={(() => null) as any}
          proposal={proposal}
          isPreview
        />
      </>
    );
  }
}

export default connect<StateProps, {}, {}, AppState>(state => ({
  form: state.create.form as ProposalDraft,
}))(CreateFlowPreview);
