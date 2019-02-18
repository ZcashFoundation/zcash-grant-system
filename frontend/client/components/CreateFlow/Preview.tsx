import React from 'react';
import { connect } from 'react-redux';
import { ProposalDetail } from 'components/Proposal';
import { AppState } from 'store/reducers';
import { makeProposalPreviewFromDraft } from 'modules/create/utils';
import { ProposalDraft } from 'types';
import './Preview.less';

interface StateProps {
  form: ProposalDraft;
}

type Props = StateProps;

class CreateFlowPreview extends React.Component<Props> {
  render() {
    const { form } = this.props;
    const proposal = makeProposalPreviewFromDraft(form);
    return (
      <div className="Preview">
        <ProposalDetail
          user={null}
          proposalId={0}
          fetchProposal={(() => null) as any}
          detail={proposal}
          isFetchingDetail={false}
          detailError={null}
          isPreview
        />
      </div>
    );
  }
}

export default connect<StateProps, {}, {}, AppState>(state => ({
  form: state.create.form as ProposalDraft,
}))(CreateFlowPreview);
