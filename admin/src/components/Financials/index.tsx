import React from 'react';
import { Spin } from 'antd';
import { view } from 'react-easy-state';
import store from '../../store';
import './index.less';

class Financials extends React.Component {
  componentDidMount() {
    store.fetchFinancials();
  }

  render() {
    if (!store.financialsFetched) {
      return <Spin tip="Loading financials..." />;
    }
    return (
      <div className="Financials">
        <pre>{JSON.stringify(store.financials, null, 2)}</pre>
      </div>
    );
  }
}

export default view(Financials);
