import React from 'react';
import { Modal, Button, Form, Input } from 'antd';
import { Divider, message } from 'antd';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import { updateProposal, TUpdateProposal } from 'modules/proposals/actions';
import { Proposal } from 'types';
import { updateProposalTipJarSettings } from 'api/api';
import { isValidAddress } from 'utils/validators';

interface OwnProps {
  proposal: Proposal;
  handleClose: () => void;
  isVisible: boolean;
}

interface DispatchProps {
  updateProposal: TUpdateProposal;
}

type Props = OwnProps & DispatchProps;

interface State {
  setViewKey: string | null;
  setAddress: string | null;
  address: string | null;
  viewKey: string | null;
  isSavingAddress: boolean;
  isSavingViewKey: boolean;
}

class TipJarProposalSettingsModalBase extends React.Component<Props, State> {
  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { proposal } = nextProps;
    const { setAddress, setViewKey, address, viewKey } = prevState;

    const ret: Partial<State> = {};

    if (proposal.tipJarAddress !== setAddress) {
      ret.setAddress = proposal.tipJarAddress;

      if (address === null) {
        ret.address = proposal.tipJarAddress;
      }
    }

    if (proposal.tipJarViewKey !== setViewKey) {
      ret.setViewKey = proposal.tipJarViewKey;

      if (viewKey === null) {
        ret.viewKey = proposal.tipJarViewKey;
      }
    }

    return ret;
  }

  state: State = {
    setViewKey: null,
    setAddress: null,
    address: null,
    viewKey: null,
    isSavingAddress: false,
    isSavingViewKey: false,
  };

  render() {
    const {
      address,
      viewKey,
      setAddress,
      setViewKey,
      isSavingAddress,
      isSavingViewKey,
    } = this.state;

    let addressIsValid;
    let addressStatus: 'validating' | 'error' | undefined;
    let addressHelp;
    if (address !== null) {
      addressIsValid = address === '' || isValidAddress(address);
    }
    if (address !== null && !addressIsValid) {
      addressStatus = 'error';
      addressHelp = 'That doesn’t look like a valid address';
    }

    const addressHasChanged = address !== setAddress;
    const viewKeyHasChanged = viewKey !== setViewKey;

    const addressInputDisabled = isSavingAddress;
    const viewKeyInputDisabled = isSavingViewKey || !setAddress;

    const addressButtonDisabled =
      !addressHasChanged || isSavingAddress || !addressIsValid;
    const viewKeyButtonDisabled = !viewKeyHasChanged || isSavingViewKey || !setAddress;

    const content = (
      <>
        <Form layout="vertical" onSubmit={this.handleTipJarAddressSubmit}>
          <Form.Item
            label="Tip Address"
            validateStatus={addressStatus}
            help={addressHelp}
          >
            <Input
              value={address || ''}
              placeholder="Z or T address"
              onChange={this.handleTipJarAddressChange}
              disabled={addressInputDisabled}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            disabled={addressButtonDisabled}
            loading={isSavingAddress}
            block
          >
            Change tip address
          </Button>
        </Form>

        <Divider style={{ margin: '2.5rem 0' }} />

        <Form layout="vertical" onSubmit={this.handleTipJarViewKeySubmit}>
          <Form.Item label="Tip View Key">
            <Input
              value={viewKey || ''}
              placeholder="A view key for your tip jar address (optional)"
              onChange={this.handleTipJarViewKeyChange}
              disabled={viewKeyInputDisabled}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            disabled={viewKeyButtonDisabled}
            loading={isSavingViewKey}
            block
          >
            Change tip view key
          </Button>
        </Form>
      </>
    );

    return (
      <Modal
        title={`Manage Proposal Tip Settings`}
        visible={this.props.isVisible}
        onCancel={this.props.handleClose}
        centered
        footer={
          <Button type="primary" onClick={this.props.handleClose}>
            Done
          </Button>
        }
      >
        {content}
      </Modal>
    );
  }

  handleTipJarViewKeyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ viewKey: e.currentTarget.value });

  handleTipJarAddressChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ address: e.currentTarget.value });

  handleTipJarAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const {
      proposal: { proposalId },
    } = this.props;
    const { address } = this.state;

    if (address === null) return;

    this.setState({ isSavingAddress: true });
    try {
      const res = await updateProposalTipJarSettings(proposalId, { address });
      message.success('Address saved');
      this.props.updateProposal(res.data);
    } catch (err) {
      console.error(err);
      message.error(err.message || err.toString(), 5);
    }
    this.setState({ isSavingAddress: false });
  };

  handleTipJarViewKeySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const {
      proposal: { proposalId },
    } = this.props;
    const { viewKey } = this.state;

    if (viewKey === null) return;

    this.setState({ isSavingViewKey: true });
    try {
      const res = await updateProposalTipJarSettings(proposalId, { viewKey });
      message.success('View key saved');
      this.props.updateProposal(res.data);
    } catch (err) {
      console.error(err);
      message.error(err.message || err.toString(), 5);
    }
    this.setState({ isSavingViewKey: false });
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators({ updateProposal }, dispatch);
}

export const TipJarProposalSettingsModal = connect<{}, DispatchProps, OwnProps, AppState>(
  null,
  mapDispatchToProps,
)(TipJarProposalSettingsModalBase);
