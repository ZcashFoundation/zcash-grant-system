import React from 'react';
import { view } from 'react-easy-state';
import { Link } from 'react-router-dom';
import { RouteComponentProps, withRouter } from 'react-router';
import store from 'src/store';
import Example from './Example';
import EMAILS from './emails';
import './index.less';

type Props = RouteComponentProps<any>;

interface State {
  examples: any;
}

class Emails extends React.Component<Props, State> {
  state: State = {
    examples: {},
  };

  componentDidMount() {
    const { type } = this.props.match.params;
    if (type && !store.emailExamples[type]) {
      this.getEmailExample(type);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { type } = this.props.match.params;
    const prevType = prevProps.match.params.type;
    if (type && type !== prevType && !store.emailExamples[type]) {
      this.getEmailExample(type);
    }
  }

  render() {
    const { type } = this.props.match.params;

    let content;
    if (type) {
      content = <Example email={store.emailExamples[type]} />;
    } else {
      content = EMAILS.map(e => (
        <Link key={e.id} to={`/emails/${e.id}`}>
          <div className="Emails-email">
            <h2>
              {e.title} <small>({e.id})</small>
            </h2>
            <p>{e.description}</p>
          </div>
        </Link>
      ));
    }

    return (
      <div className="Emails">
        <h1>Emails</h1>
        {content}
      </div>
    );
  }

  private getEmailExample(type: string) {
    const email = EMAILS.find(e => e.id === type);
    if (!email) {
      return alert('Invalid email type!');
    }
    store.getEmailExample(type, email.args);
  }
}

export default withRouter(view(Emails));