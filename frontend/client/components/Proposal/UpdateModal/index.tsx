import React from 'react';
import { connect } from 'react-redux';
import { Modal, Alert, Input, Button } from 'antd';
import Result from 'ant-design-pro/lib/Result';
import { fetchProposalUpdates } from 'modules/proposals/actions';
import { postProposalUpdate } from 'api/api';
import MarkdownEditor from 'components/MarkdownEditor';
import './style.less';

interface DispatchProps {
  fetchProposalUpdates: typeof fetchProposalUpdates;
}

interface OwnProps {
  proposalId: number;
  isVisible: boolean;
  handleClose(): void;
}

type Props = DispatchProps & OwnProps;

interface State {
  title: string;
  content: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  error: string | null;
}

const INITIAL_STATE = {
  title: '',
  content: '',
  isSubmitting: false,
  hasSubmitted: false,
  error: null,
};

class UpdateModal extends React.Component<Props, State> {
  state: State = { ...INITIAL_STATE };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.isVisible && !this.props.isVisible) {
      this.setState({ ...INITIAL_STATE });
    }
  }

  render() {
    const { isVisible } = this.props;
    const { isSubmitting, hasSubmitted, error, title, content } = this.state;
    const isMissingFields = !title || !content;

    return (
      <Modal
        title="Post an Update"
        visible={isVisible}
        okText="Submit"
        cancelText="Cancel"
        onOk={this.postUpdate}
        onCancel={this.closeModal}
        okButtonProps={{
          loading: isSubmitting,
          disabled: isMissingFields,
        }}
        cancelButtonProps={{ disabled: isSubmitting }}
        footer={hasSubmitted ? '' : undefined}
        width={800}
        centered
      >
        <div className="UpdateModal">
          {hasSubmitted ? (
            <Result
              type="success"
              title="Update has been posted"
              description="Your funders have been notified, thanks for updating them"
              actions={<Button onClick={this.closeModal}>Close</Button>}
            />
          ) : (
            <div className="UpdateModal-form">
              <Input
                className="UpdateModal-form-title"
                size="large"
                value={title}
                placeholder="Title (60 char max)"
                onChange={this.handleChangeTitle}
              />
              <MarkdownEditor onChange={this.handleChangeContent} minHeight={200} />
            </div>
          )}
          {error && (
            <Alert
              type="error"
              message="Failed to post update proposal"
              description={error}
              showIcon
            />
          )}
        </div>
      </Modal>
    );
  }

  private handleChangeTitle = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: ev.currentTarget.value });
  };

  private handleChangeContent = (markdown: string) => {
    this.setState({ content: markdown });
  };

  private closeModal = () => {
    const { isSubmitting, hasSubmitted, title, content } = this.state;
    if (!isSubmitting) {
      const empty = !title && !content;
      if (
        empty ||
        hasSubmitted ||
        confirm('Are you sure you want to close? You’ll lose this draft.')
      ) {
        this.props.handleClose();
      }
    }
  };

  private postUpdate = () => {
    const { proposalId } = this.props;
    const { title, content, hasSubmitted, isSubmitting } = this.state;

    if (hasSubmitted || isSubmitting) {
      return;
    }

    this.setState({ isSubmitting: true });
    postProposalUpdate(proposalId, title, content)
      .then(() => {
        this.setState({
          hasSubmitted: true,
          isSubmitting: false,
        });
        this.props.fetchProposalUpdates(proposalId);
      })
      .catch(err => {
        this.setState({
          error: err.message || err.toString(),
          isSubmitting: false,
        });
      });
  };
}

export default connect(
  undefined,
  { fetchProposalUpdates },
)(UpdateModal);
