import React from 'react';
import { withNamespaces, WithNamespaces } from 'react-i18next';
import HeaderDetails from 'components/HeaderDetails';
import Intro from './Intro';
import Requests from './Requests';
import Guide from './Guide';
import Actions from './Actions';
import Latest from './Latest';
import './style.less';

class Home extends React.Component<WithNamespaces> {
  render() {
    const { t } = this.props;
    return (
      <div className="Home">
        <HeaderDetails title={t('home.title')} description={t('home.description')} />
        <Intro />
        <Latest />
        <Requests />
        <Guide />
        <Actions />
      </div>
    );
  }
}

export default withNamespaces()(Home);
