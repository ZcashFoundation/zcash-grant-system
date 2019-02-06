import React from 'react';
import { view } from 'react-easy-state';
import { RouteComponentProps, withRouter } from 'react-router';
import { Form, Input, Button, message, Spin } from 'antd';
import Exception from 'ant-design-pro/lib/Exception';
import { FormComponentProps } from 'antd/lib/form';
import { ContributionArgs, CONTRIBUTION_STATUS } from 'src/types';
import Back from 'components/Back';
import store from 'src/store';
import './index.less';

type Props = FormComponentProps & RouteComponentProps<{ id?: string }>;

class ContributionForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    const id = this.getId();
    if (id) {
      store.fetchContributionDetail(id);
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    let defaults: Partial<ContributionArgs> = {
      proposalId: '',
      userId: '',
      amount: '',
      txId: '',
    };
    const id = this.getId();
    const contribution = this.getContribution();
    if (id) {
      if (store.contributionDetailFetching) {
        return <Spin />;
      }
      if (!contribution) {
        return <Exception type="404" desc="This contribution does not exist" />;
      }
      defaults = {
        proposalId: contribution.proposal.proposalId,
        userId: contribution.user.userid,
        amount: contribution.amount,
        txId: contribution.txId || '',
      };
    }

    return (
      <Form className="ContributionForm" layout="vertical" onSubmit={this.handleSubmit}>
        <Back to="/contributions" text="Contributions" />
        <Form.Item label="Proposal ID">
          {getFieldDecorator('proposalId', {
            initialValue: defaults.proposalId,
            rules: [
              { required: true, message: 'Proposal ID is required' },
            ],
          })(
            <Input
              autoComplete="off"
              name="proposalId"
              placeholder="Must be an existing proposal id"
              autoFocus
            />,
          )}
        </Form.Item>

        <Form.Item label="User ID">
          {getFieldDecorator('userId', {
            initialValue: defaults.userId,
            rules: [
              { required: true, message: 'User ID is required' },
            ],
          })(
            <Input
              autoComplete="off"
              name="userId"
              placeholder="Must be an existing user id"
            />,
          )}
        </Form.Item>

        <Form.Item label="Contribution amount">
          {getFieldDecorator('amount', {
            initialValue: defaults.amount,
            rules: [
              { required: true, message: 'Must have an amount specified' },
            ],
          })(
            <Input
              autoComplete="off"
              name="amount"
              placeholder="Amount in ZEC, no more than 4 decimals"
            />,
          )}
        </Form.Item>

        <Form.Item
          label="Transaction ID"
          help={`
            Providing a txid will set status to CONFIRMED, leaving
            blank will set status to PENDING.
          `}>
          {getFieldDecorator('txId', {
            initialValue: defaults.txId,
          })(
            <Input
              autoComplete="off"
              name="amount"
              placeholder="e.g. 7ae7bc1759a2bb9aa40b34daa3..."
            />,
          )}
        </Form.Item>

        <div className="ContributionForm-buttons">
          <Button type="primary" htmlType="submit" size="large">
            Submit
          </Button>
          <Button type="ghost" size="large">
            Cancel
          </Button>
        </div>
      </Form>
    );
  }

  private getId = () => {
    const id = this.props.match.params.id;
    if (id) {
      return parseInt(id, 10);
    }
  };

  private getContribution = () => {
    const id = this.getId();
    if (id && store.contributionDetail && store.contributionDetail.id === id) {
      return store.contributionDetail;
    }
  };

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err: any, values: any) => {
      if (err) return;

      const id = this.getId();
      const args = {
        ...values,
        status: values.txId
          ? CONTRIBUTION_STATUS.CONFIRMED
          : CONTRIBUTION_STATUS.PENDING,
      };
      let msg;
      if (id) {
        await store.editContribution(id, args);
        msg = 'Successfully updated contribution';
      } else {
        await store.createContribution(args);
        msg = 'Successfully created contribution';
      }

      if (store.contributionSaved) {
        message.success(msg, 3);
        this.props.history.replace('/contributions');
      }
    });
  };
}

export default Form.create()(withRouter(view(ContributionForm)));
