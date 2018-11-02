import React from 'react';
import { view } from 'react-easy-state';
import { Icon, Button, Popover, InputNumber, Checkbox, Alert, Input } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import Showdown from 'showdown';
import moment from 'moment';
import store from 'src/store';
import {
  Proposal,
  Contract,
  ContractMethod as TContractMethod,
  ContractMilestone,
  ContractContributor,
} from 'src/types';
import './index.less';
import Field from 'components/Field';
import { Link } from 'react-router-dom';

const showdownConverter = new Showdown.Converter({
  simplifiedAutoLink: true,
  tables: true,
  strikethrough: true,
  disableForced4SpacesIndentedSublists: true,
  openLinksInNewWindow: true,
  excludeTrailingPunctuationFromURLs: true,
});

type Props = RouteComponentProps<any>;

class ProposalsNaked extends React.Component<Props> {
  componentDidMount() {
    store.fetchProposals();
  }

  render() {
    const id = this.props.match.params.id;
    const { proposals, proposalsFetched } = store;

    if (!proposalsFetched) {
      return 'loading proposals...';
    }

    if (id) {
      const singleProposal = proposals.find(p => p.proposalId === id);
      if (singleProposal) {
        return (
          <div className="Proposals">
            <div className="Proposals-controls">
              <Link to="/proposals">proposals</Link> <Icon type="right" /> {id}{' '}
              <Button
                title="refresh"
                icon="reload"
                onClick={() => store.fetchProposals()}
              />
              <div className="Proposals-controls-status">
                {store.crowdFundGeneralStatus}
              </div>
            </div>
            <ProposalItem key={singleProposal.proposalId} {...singleProposal} />
          </div>
        );
      } else {
        return `could not find proposal: ${id}`;
      }
    }

    return (
      <div className="Proposals">
        <div className="Proposals-controls">
          <Button title="refresh" icon="reload" onClick={() => store.fetchProposals()} />
          <div className="Proposals-controls-status">{store.crowdFundGeneralStatus}</div>
        </div>
        {proposals.length === 0 && <div>no proposals</div>}
        {proposals.length > 0 &&
          proposals.map(p => <ProposalItem key={p.proposalId} {...p} />)}
      </div>
    );
  }
}

// tslint:disable-next-line:max-classes-per-file
class ProposalItemNaked extends React.Component<Proposal> {
  state = {
    showDelete: false,
  };
  render() {
    const p = this.props;
    const body = showdownConverter.makeHtml(p.body);
    return (
      <div key={p.proposalId} className="Proposals-proposal">
        <div>
          <div className="Proposals-proposal-controls">
            <Popover
              content={
                <div>
                  <Button type="primary" onClick={this.handleDelete}>
                    delete {p.title}
                  </Button>{' '}
                  <Button onClick={() => this.setState({ showDelete: false })}>
                    cancel
                  </Button>
                </div>
              }
              title="Permanently delete proposal?"
              trigger="click"
              visible={this.state.showDelete}
              onVisibleChange={showDelete => this.setState({ showDelete })}
            >
              <Button icon="delete" shape="circle" size="small" title="delete" />
            </Popover>
            {/* TODO: implement disable payments on BE */}
            <Button
              icon="dollar"
              shape="circle"
              size="small"
              title={false ? 'allow payments' : 'disable payments'}
              type={false ? 'danger' : 'default'}
              disabled={true}
            />
          </div>
          <b>{p.title}</b> {p.proposalId} <Field title="category" value={p.category} />
          <Field title="dateCreated" value={p.dateCreated * 1000} isTime={true} />
          <Field title="stage" value={p.stage} />
          <Field
            title={`team (${p.team.length})`}
            value={
              <div>
                {p.team.map(u => (
                  <div key={u.userid}>
                    {u.displayName} (
                    <Link to={`/users/${u.accountAddress}`}>{u.accountAddress}</Link>)
                  </div>
                ))}
              </div>
            }
          />
          <Field
            title={`comments (${p.comments.length})`}
            value={<div>TODO: comments</div>}
          />
          <Field
            title={`body (${body.length}chr)`}
            value={
              <div
                className="Proposals-proposal-body"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            }
          />
          <Field
            title={`milestones (${p.milestones.length})`}
            value={
              <div className="Proposals-proposal-milestones">
                {p.milestones.map((ms, idx) => (
                  <div key={idx}>
                    <div>
                      <b>
                        {idx}. {ms.title}
                      </b>
                      <span>(title)</span>
                    </div>
                    <div>
                      {moment(ms.dateCreated).format('YYYY/MM/DD h:mm a')}
                      <span>(dateCreated)</span>
                    </div>
                    <div>
                      {moment(ms.dateEstimated).format('YYYY/MM/DD h:mm a')}
                      <span>(dateEstimated)</span>
                    </div>
                    <div>
                      {ms.stage}
                      <span>(stage)</span>
                    </div>
                    <div>
                      {JSON.stringify(ms.immediatePayout)}
                      <span>(immediatePayout)</span>
                    </div>
                    <div>
                      {ms.payoutPercent}
                      <span>(payoutPercent)</span>
                    </div>
                    <div>
                      {ms.body}
                      <span>(body)</span>
                    </div>
                    {/* <small>content</small>
                    <div>{ms.content}</div> */}
                  </div>
                ))}
              </div>
            }
          />
          {!store.web3Enabled && <Field title="web3" value={'UNAVAILABLE'} />}
          {store.web3Enabled && (
            <Field
              title={`web3 (${p.contractStatus || 'not loaded'})`}
              value={
                <div className="Proposals-proposal-contract">
                  <Button
                    icon="reload"
                    size="small"
                    title="refresh contract"
                    onClick={() => store.populateProposalContract(p.proposalId)}
                  >
                    refresh contract
                  </Button>
                  {Object.keys(p.contract)
                    .map(k => k as keyof Contract)
                    .map(k => (
                      <ContractMethod
                        key={k}
                        proposalId={p.proposalId}
                        name={k}
                        {...p.contract[k]}
                      />
                    ))}
                </div>
              }
            />
          )}
        </div>
      </div>
    );
  }
  private handleDelete = () => {
    store.deleteProposal(this.props.proposalId);
  };
}
const ProposalItem = view(ProposalItemNaked);

// tslint:disable-next-line:max-classes-per-file
class ContractMethodNaked extends React.Component<
  TContractMethod & { proposalId: string; name: string }
> {
  state = {};
  render() {
    const { name, value, status, type, format } = this.props;
    const isObj = typeof value === 'object' && value !== null;
    const isArray = Array.isArray(value);
    const fmt = (val: any) => {
      if (val && format === 'time') {
        const asNumber = Number(val) * 1000;
        return `${moment(asNumber).format()} (${moment(asNumber).fromNow()})`;
      } else if (val && format === 'duration') {
        const asNumber = Number(val) * 1000;
        return `${asNumber} (${moment.duration(asNumber).humanize()})`;
      }
      return value;
    };
    if (type === 'send') {
      return <ContractMethodSend {...this.props} />;
    }
    return (
      <div>
        <div className={`Proposals-proposal-contract-status is-${status || ''}`} />
        <span className="Proposals-proposal-contract-method">{name}:</span>
        {(!isObj && <span> {fmt(value)}</span>) || (
          <div className="Proposals-proposal-contract-array">
            {isArray &&
              name !== 'milestones' &&
              name !== 'contributors' &&
              (value as string[]).map((x, i) => (
                <div key={x}>
                  {i}: {x}
                </div>
              ))}
            {isArray &&
              name === 'milestones' && (
                <div className="Proposals-proposal-contract-array-milestones">
                  {(value as ContractMilestone[]).map((cm, idx) => (
                    <div key={idx}>
                      <div>
                        <span>paid:</span> {JSON.stringify(cm.paid)}
                      </div>
                      <div>
                        <span>amount:</span> {cm.amount}
                      </div>
                      <div>
                        <span>payoutRequestVoteDeadline:</span>{' '}
                        {Number(cm.payoutRequestVoteDeadline) < 2
                          ? cm.payoutRequestVoteDeadline
                          : moment(Number(cm.payoutRequestVoteDeadline) * 1000).fromNow()}
                      </div>
                      <div>
                        <span>amountVotingAgainstPayout:</span>{' '}
                        {cm.amountVotingAgainstPayout}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            {isArray &&
              name === 'contributors' && (
                <div className="Proposals-proposal-contract-array-contributors">
                  {(value as ContractContributor[]).map(c => (
                    <div key={c.address}>
                      <div>
                        <span>address:</span> {c.address}
                      </div>
                      <div>
                        <span>milestoneNoVotes:</span>{' '}
                        {JSON.stringify(c.milestoneNoVotes)}
                      </div>
                      <div>
                        <span>contributionAmount:</span> {c.contributionAmount}
                      </div>
                      <div>
                        <span>refundVote:</span> {JSON.stringify(c.refundVote)}
                      </div>
                      <div>
                        <span>refunded:</span> {JSON.stringify(c.refunded)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    );
  }
}
const ContractMethod = view(ContractMethodNaked);

// tslint:disable-next-line:max-classes-per-file
class ContractMethodSendNaked extends React.Component<
  TContractMethod & { proposalId: string; name: string }
> {
  state = {
    args: this.props.input.map(i => (i.type === 'boolean' ? false : '')) as any[],
  };
  render() {
    const { name, status, input, proposalId, error } = this.props;
    return (
      <div className="Proposals-proposal-contract-method">
        <div className={`Proposals-proposal-contract-status is-${status || ''}`} />
        <div className="Proposals-proposal-contract-inputs">
          {input.length === 0 && 'no input'}
          {input.map(
            (x, idx) =>
              ((x.type === 'wei' || x.type === 'integer') && (
                <InputNumber
                  size="small"
                  key={x.name}
                  name={x.name}
                  placeholder={`${x.name} (${x.type})`}
                  onChange={val => {
                    const args = [...this.state.args];
                    args[idx] = val;
                    this.setState({ args });
                  }}
                  value={this.state.args[idx]}
                  className={`Proposals-proposal-contract-input is-${x.type || ''}`}
                />
              )) ||
              (x.type === 'string' && (
                <Input
                  size="small"
                  key={x.name}
                  name={x.name}
                  placeholder={`${x.name} (${x.type})`}
                  onChange={evt => {
                    const args = [...this.state.args];
                    args[idx] = evt.currentTarget.value;
                    this.setState({ args });
                  }}
                  value={this.state.args[idx]}
                  className={`Proposals-proposal-contract-input is-${x.type || ''}`}
                />
              )) || (
                <Checkbox
                  key={x.name}
                  onChange={evt => {
                    const args = [...this.state.args];
                    args[idx] = evt.target.checked;
                    this.setState({ args });
                  }}
                  value={this.state.args[idx]}
                  className={`Proposals-proposal-contract-input is-${x.type || ''}`}
                >
                  {x.name}
                </Checkbox>
              ),
          )}
        </div>
        <Button
          icon="arrow-right"
          size="default"
          loading={status === 'loading' || status === 'waiting'}
          onClick={() =>
            store.proposalContractSend(
              proposalId,
              name as keyof Contract,
              input,
              this.state.args,
            )
          }
        >
          {name}
        </Button>
        {error && <Alert message={error} type="error" closable={true} />}
      </div>
    );
  }
}
const ContractMethodSend = view(ContractMethodSendNaked);

const Proposals = withRouter(view(ProposalsNaked));
export default Proposals;
