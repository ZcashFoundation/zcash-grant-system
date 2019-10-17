import { debounce } from 'lodash';
import React from 'react';
import { view } from 'react-easy-state';
import { Button, Modal, Input, Icon, List, Avatar, message } from 'antd';
import store from 'src/store';
import { Proposal, User, PROPOSAL_ARBITER_STATUS } from 'src/types';
import Search from 'antd/lib/input/Search';
import { ButtonProps } from 'antd/lib/button';
import './index.less';

interface OwnProps {
  buttonProps?: ButtonProps;
}

type Props = OwnProps & Proposal;

const STATE = {
  showSearch: false,
  searching: false,
};
type State = typeof STATE;

class ArbiterControlNaked extends React.Component<Props, State> {
  state = STATE;
  searchInput: null | Search = null;

  private searchArbiter = debounce(async search => {
    await store.searchArbiters(search);
    this.setState({ searching: false });
  }, 1000);

  render() {
    const { arbiter, isVersionTwo, acceptedWithFunding } = this.props;
    const { showSearch, searching } = this.state;
    const { results, search, error } = store.arbitersSearch;
    const showEmpty = !results.length && !searching;
    const buttonDisabled = isVersionTwo && acceptedWithFunding === false 

    const disp = {
      [PROPOSAL_ARBITER_STATUS.MISSING]: 'Nominate arbiter',
      [PROPOSAL_ARBITER_STATUS.NOMINATED]: 'Change nomination',
      [PROPOSAL_ARBITER_STATUS.ACCEPTED]: 'Change arbiter',
    };

    return (
      <>
        {/* CONTROL */}
        <Button
          className="ArbiterControl-control"
          loading={store.arbiterSaving}
          icon="crown"
          type="primary"
          onClick={this.handleShowSearch}
          {...this.props.buttonProps}
          disabled={buttonDisabled}
        >
          {disp[arbiter.status]}
        </Button>
        {/* SEARCH MODAL */}
        {showSearch && (
          <Modal
            title={
              <>
                <Icon type="crown" /> Nominate an arbiter
              </>
            }
            visible={true}
            footer={null}
            onCancel={this.handleCloseSearch}
          >
            <>
              <Input.Search
                ref={x => (this.searchInput = x)}
                placeholder="name or email"
                onChange={this.handleSearchInputChange}
              />
              {/* EMPTY RESULTS */}
              {showEmpty && (
                <div className={`ArbiterControl-results no-results`}>
                  {(!error && (
                    <>
                      no arbiters found {search && ` for "${search}"`}, please type search
                      query
                    </>
                  )) || (
                    <>
                      <Icon type="exclamation-circle" /> {error}
                    </>
                  )}
                </div>
              )}
              {/* RESULTS */}
              {!showEmpty && (
                <div className="ArbiterControl-results">
                  <List
                    size="small"
                    loading={searching}
                    bordered
                    dataSource={results}
                    renderItem={(u: User) => (
                      <List.Item
                        actions={[
                          <Button
                            type="primary"
                            key="select"
                            onClick={() => this.handleSelect(u)}
                          >
                            Nominate
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon="user"
                              src={(u.avatar && u.avatar.imageUrl) || undefined}
                            />
                          }
                          title={u.displayName}
                          description={u.emailAddress}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </>
          </Modal>
        )}
      </>
    );
  }

  private handleShowSearch = () => {
    this.setState({ showSearch: true });
    // hacky way of waiting for modal to render in before focus
    setTimeout(() => {
      if (this.searchInput) this.searchInput.focus();
    }, 200);
  };

  private handleSearchInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searching: true });
    const search = ev.currentTarget.value;
    this.searchArbiter(search);
  };

  private handleSelect = async (user: User) => {
    this.setState({ showSearch: false });
    store.searchArbitersClear();
    await store.setArbiter(this.props.proposalId, user.userid);
    if (store.arbiterSaved) {
      message.success(
        <>
          <b>{user.displayName}</b> nominated as arbiter of <b>{this.props.title}</b>
        </>,
      );
    }
  };

  private handleCloseSearch = () => {
    this.setState({ showSearch: false });
    store.searchArbitersClear();
  };
}

const ArbiterControl = view(ArbiterControlNaked);
export default ArbiterControl;
