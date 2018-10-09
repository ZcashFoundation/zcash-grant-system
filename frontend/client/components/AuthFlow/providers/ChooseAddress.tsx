import React from 'react';
import { Button, Spin, Icon, Alert } from 'antd';
import classnames from 'classnames';
import Identicon from 'components/Identicon';
import ShortAddress from 'components/ShortAddress';
import './ChooseAddress.less';

interface Props {
  addresses: string[];
  loadingMessage: string;
  handleDeriveAddresses(index: number, numNeeded: number): Promise<void>;
  onSelectAddress(address: string): void;
}

interface State {
  index: number;
  isLoading: boolean;
  error: null | string;
}

const ADDRESSES_PER_PAGE = 6;

export default class ChooseAddress extends React.PureComponent<Props, State> {
  state: State = {
    index: 0,
    isLoading: false,
    error: null,
  };

  componentDidMount() {
    this.deriveAddresses();
  }

  componentDidUpdate(prevProps: Props) {
    // Detect resets of the array, kick off derive
    if (prevProps.addresses !== this.props.addresses && !this.props.addresses.length) {
      this.setState({ index: 0 }, () => {
        this.deriveAddresses();
      });
    }
  }

  render() {
    const { addresses } = this.props;
    const { index, isLoading, error } = this.state;

    let content;
    if (error) {
      content = (
        <div className="ChooseAddress-error">
          <Alert
            type="error"
            message="Something went wrong"
            description={error}
            showIcon
          />
          <Button size="large" onClick={this.deriveAddresses}>
            Try again
          </Button>
        </div>
      );
    } else {
      if (isLoading) {
        content = (
          <Spin size="large">
            <div className="ChooseAddress-loading">
              {new Array(ADDRESSES_PER_PAGE).fill(null).map((_, idx) => (
                <AddressChoice key={idx} isFake={true} name="Loading" address="0x0" />
              ))}
            </div>
          </Spin>
        );
      } else {
        const pageAddresses = addresses.slice(index, index + ADDRESSES_PER_PAGE);
        content = (
          <div className="ChooseAddress-addresses">
            {pageAddresses.map(address => (
              <AddressChoice
                key={address}
                address={address}
                name={`Address #${addresses.indexOf(address) + 1}`}
                onClick={this.props.onSelectAddress}
              />
            ))}
          </div>
        );
      }

      content = (
        <>
          {content}
          <div className="ChooseAddress-buttons">
            <Button
              className="ChooseAddress-buttons-button"
              disabled={index <= 0}
              onClick={this.prev}
            >
              <Icon type="arrow-left" />
            </Button>
            <Button className="ChooseAddress-buttons-button" onClick={this.next}>
              <Icon type="arrow-right" />
            </Button>
          </div>
        </>
      );
    }

    return <div className="ChooseAddress">{content}</div>;
  }

  private deriveAddresses = () => {
    this.setState(
      {
        isLoading: true,
        error: null,
      },
      () => {
        this.props
          .handleDeriveAddresses(this.state.index, ADDRESSES_PER_PAGE)
          .then(() => this.setState({ isLoading: false }))
          .catch(err => this.setState({ isLoading: false, error: err.message }));
      },
    );
  };

  private next = () => {
    this.setState({ index: this.state.index + ADDRESSES_PER_PAGE }, () => {
      if (!this.props.addresses[this.state.index + ADDRESSES_PER_PAGE]) {
        this.deriveAddresses();
      }
    });
  };

  private prev = () => {
    this.setState({ index: Math.max(0, this.state.index - ADDRESSES_PER_PAGE) });
  };
}

interface AddressChoiceProps {
  address: string;
  name: string;
  isFake?: boolean;
  onClick?(address: string): void;
}

const AddressChoice: React.SFC<AddressChoiceProps> = props => (
  <button
    className={classnames('AddressChoice', props.isFake && 'is-fake')}
    onClick={props.onClick ? () => props.onClick(props.address) : undefined}
  >
    {/* TODO: Use user avatar + name if they have an account */}
    {props.isFake ? (
      <div className="AddressChoice-avatar" />
    ) : (
      <Identicon className="AddressChoice-avatar" address={props.address} />
    )}
    <div className="AddressChoice-name">{props.name}</div>
    <div className="AddressChoice-address">
      <ShortAddress address={props.address} />
    </div>
  </button>
);
