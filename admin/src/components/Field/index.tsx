import React from 'react';
import { Collapse } from 'antd';
import moment from 'moment';
import './index.less';

interface Props {
  title: string | JSX.Element;
  value: string | number | JSX.Element;
  isTime?: boolean;
}

function fmtTime(n: number) {
  return moment(n).format('YYYY/MM/DD h:mm a');
}

export default class CollapseField extends React.Component<Props> {
  render() {
    const { title, value } = this.props;

    if (null === value || ['string', 'number'].indexOf(typeof value) > -1) {
      return (
        <div className="Field">
          <div className="Field-value">
            {this.props.isTime ? fmtTime(Number(value)) : value || 'n/a'}
            <span className="Field-title">({title})</span>
          </div>
        </div>
      );
    }

    return (
      <Collapse className="Field" bordered={false}>
        <Collapse.Panel header={title} key="1">
          {value}
        </Collapse.Panel>
      </Collapse>
    );
  }
}
