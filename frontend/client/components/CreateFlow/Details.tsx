import React from 'react';
import { Form } from 'antd';
import MarkdownEditor from 'components/MarkdownEditor';
import { CreateFormState } from 'types';

interface State {
  details: string;
}

interface Props {
  initialState?: Partial<State>;
  updateForm(form: Partial<CreateFormState>): void;
}

export default class CreateFlowTeam extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      details: '',
      ...(props.initialState || {}),
    };
  }

  render() {
    return (
      <Form layout="vertical" style={{ maxWidth: 980, margin: '0 auto' }}>
        <MarkdownEditor
          onChange={this.handleChange}
          initialMarkdown={this.state.details}
        />
      </Form>
    );
  }

  private handleChange = (markdown: string) => {
    this.setState({ details: markdown }, () => {
      this.props.updateForm(this.state);
    });
  };
}
