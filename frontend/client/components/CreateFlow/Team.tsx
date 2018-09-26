import React from 'react';
import Placeholder from 'components/Placeholder';
import { CreateFormState } from 'modules/create/types';

type State = object;

interface Props {
  initialState?: Partial<State>;
  updateForm(form: Partial<CreateFormState>): void;
}

export default class CreateFlowTeam extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...(props.initialState || {}),
    };
  }

  render() {
    return (
      <Placeholder
        style={{ maxWidth: 580, margin: '0 auto' }}
        title="Team isn’t implemented yet"
        subtitle="We don’t yet have users built out. Skip this step for now."
      />
    );
  }
}
