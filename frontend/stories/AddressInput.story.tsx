import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { DONATION } from 'utils/constants';

import 'components/AddressInput.less';
import AddressInput, { Props as AddressInputProps } from 'components/AddressInput';

const cases: ExampleProps[] = [
  {
    disp: 'Default Input',
    props: {},
    defaultValue: '',
  },
  {
    disp: 'Input w/ Identicon',
    props: {
      showIdenticon: true,
    },
  },
  {
    disp: 'Input w/ Identicon (large)',
    props: {
      showIdenticon: true,
      inputProps: {
        size: 'large',
      },
    },
  },
  {
    disp: 'Input w/ Identicon (small)',
    props: {
      showIdenticon: true,
      inputProps: {
        size: 'small',
      },
    },
  },
  {
    disp: 'Invalid Input',
    props: {},
    defaultValue: '0x0what',
  },
];

storiesOf('AddressInput', module).add('all', () => (
  <div style={{ padding: '2em' }}>
    {cases.map(c => (
      <Example key={c.disp} {...c} />
    ))}
  </div>
));

interface ExampleProps {
  disp: string;
  defaultValue?: string;
  props: Partial<AddressInputProps>;
}

interface ExampleState {
  value: string;
}

class Example extends React.Component<ExampleProps, ExampleState> {
  constructor(props: ExampleProps) {
    super(props);
    this.state = {
      value: props.defaultValue !== undefined ? props.defaultValue : DONATION.ETH,
    };
  }

  render() {
    const props = {
      ...this.props.props,
      value: this.state.value,
      onChange: this.handleChange,
    };

    return (
      <div style={{ marginBottom: '2rem', width: '280px' }}>
        <div style={{ fontSize: '0.9em', paddingBottom: '0.5rem' }}>
          {this.props.disp}
        </div>
        <AddressInput {...props} />
      </div>
    );
  }

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: ev.currentTarget.value });
  };
}
