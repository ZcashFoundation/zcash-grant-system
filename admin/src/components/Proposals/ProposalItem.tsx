import React from 'react';
import { view } from 'react-easy-state';
import { Menu, Dropdown, Icon, Popconfirm } from 'antd';
import Showdown from 'showdown';
import moment from 'moment';
import store from 'src/store';
import { Proposal } from 'src/types';
import Field from 'components/Field';
import { Link } from 'react-router-dom';
import './ProposalItem.less';

const showdownConverter = new Showdown.Converter({
  simplifiedAutoLink: true,
  tables: true,
  strikethrough: true,
  disableForced4SpacesIndentedSublists: true,
  openLinksInNewWindow: true,
  excludeTrailingPunctuationFromURLs: true,
});

class ProposalItemNaked extends React.Component<Proposal> {
  state = {
    showDelete: false,
  };
  render() {
    const p = this.props;
    const body = showdownConverter.makeHtml(p.content);

    const actionsMenu = (
      <Menu>
        <Menu.Item key="delete">
          <Popconfirm
            onConfirm={this.handleDelete}
            title="Permanently delete proposal?"
            okText="delete"
            cancelText="cancel"
          >
            <div>delete</div>
          </Popconfirm>
        </Menu.Item>
        <Menu.Item disabled={true} key="disablePayments">
          disable payments
        </Menu.Item>
      </Menu>
    );

    const actionsDropdown = (
      <Dropdown overlay={actionsMenu} trigger={['click']}>
        <a className="ant-dropdown-link" href="#">
          Actions <Icon type="down" />
        </a>
      </Dropdown>
    );

    return (
      <div key={p.proposalId} className="ProposalItem">
        <div>
          <div className="ProposalItem-controls">
            {/* TODO: implement disable payments on BE */}
            {actionsDropdown}
            {/* <Button
              icon="dollar"
              shape="circle"
              size="small"
              title={false ? 'allow payments' : 'disable payments'}
              type={false ? 'danger' : 'default'}
              disabled={true}
            /> */}
          </div>
          <b>{p.title}</b> [{p.proposalId}]{p.proposalAddress}{' '}
          <Field title="status" value={p.status} />
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
                className="ProposalItem-body"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            }
          />
          <Field
            title={`milestones (${p.milestones.length})`}
            value={
              <div className="ProposalItem-milestones">
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
export default ProposalItem;
