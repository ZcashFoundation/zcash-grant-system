import React from 'react';
import { connect } from 'react-redux';
import { Alert } from 'antd';
import { ProposalDetail } from 'components/Proposal';
import { AppState } from 'store/reducers';
import { makeProposalPreviewFromForm } from 'modules/create/utils';

interface StateProps {
  form: AppState['create']['form'];
}

type Props = StateProps;

class CreateFlowPreview extends React.Component<Props> {
  render() {
    const { form } = this.props;
    const proposal = makeProposalPreviewFromForm(form);
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
          proposalId="preview"
          fetchProposal={() => null}
          proposal={proposal}
          isPreview
        />
      </>
    );
  }
}

export default connect<StateProps, {}, {}, AppState>(state => ({
  form: state.create.form,
}))(CreateFlowPreview);
