import React from 'react';
import { view } from 'react-easy-state';
import { Icon, Button, Popover } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import Showdown from 'showdown';
import moment from 'moment';
import store from 'src/store';
import { Proposal } from 'src/types';
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
    const id = Number(this.props.match.params.id);
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
    const body = showdownConverter.makeHtml(p.content);
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
          <b>{p.title}</b> [{p.proposalId}]{p.proposalAddress}{' '}
          <Field title="category" value={p.category} />
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
                      {ms.content}
                      <span>(body)</span>
                    </div>
                    {/* <small>content</small>
                    <div>{ms.content}</div> */}
                  </div>
                ))}
              </div>
            }
          />
        </div>
      </div>
    );
  }
  private handleDelete = () => {
    store.deleteProposal(this.props.proposalId);
  };
}
const ProposalItem = view(ProposalItemNaked);

const Proposals = withRouter(view(ProposalsNaked));
export default Proposals;
