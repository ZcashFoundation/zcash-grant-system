import React from 'react';
import { view } from 'react-easy-state';
import store from 'src/store';
import { Popconfirm, List, Avatar, Icon, message } from 'antd';
import { Link } from 'react-router-dom';
import { Comment } from 'src/types';
import { formatDateSeconds } from 'util/time';
import Markdown from '../Markdown';
import ShowMore from 'components/ShowMore';
import './ModerationItem.less';

class ModerationItem extends React.Component<Comment> {
  render() {
    const p = this.props;
    const avatarUrl = (p.author!.avatar && p.author!.avatar!.imageUrl) || undefined;
    const actions = [
      <Popconfirm
        key="toggleHide"
        onConfirm={this.handleHide}
        title={`${
          p.hidden ? 'Show' : 'Hide'
        } the content of this comment on public view?`}
        okText={p.hidden ? 'Show' : 'Hide'}
        okType="primary"
        placement="left"
      >
        <a>{p.hidden ? 'show' : 'hide'}</a>
      </Popconfirm>,
    ];

    return (
      <List.Item className="ModerationItem" actions={actions}>
        <List.Item.Meta
          avatar={<Avatar icon="user" src={avatarUrl} shape="square" />}
          title={
            <>
              <Link to={`/users/${p.author!.userid}`}>{p.author!.displayName}</Link>{' '}
              <small>commented on</small>{' '}
              <Link to={`/proposals/${p.proposalId}`}>
                {p.proposal && p.proposal.title}
              </Link>{' '}
              <small>at {formatDateSeconds(p.dateCreated)}</small>{' '}
              {p.hidden && (
                <>
                  <Icon type="eye-invisible" />{' '}
                </>
              )}
              {p.reported && (
                <>
                  <Icon type="flag" />{' '}
                </>
              )}
            </>
          }
          description={
            <ShowMore height={100}>
              <Markdown source={p.content} reduced />
            </ShowMore>
          }
        />
      </List.Item>
    );
  }
  private handleHide = async () => {
    await store.updateComment(this.props.id, { hidden: !this.props.hidden });
    if (store.commentSaved) {
      message.success(
        <>
          <b>
            {this.props.author!.displayName}
            's
          </b>{' '}
          comment on <b>{this.props.proposal!.title}</b>{' '}
          {this.props.hidden ? 'hidden' : 'now visible'}
        </>,
      );
    }
  };
}

export default view(ModerationItem);
