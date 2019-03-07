import React from 'react';
import { Spin, Card, Row, Col } from 'antd';
import { Charts } from 'ant-design-pro';
import { view } from 'react-easy-state';
import store from '../../store';
import Info from 'components/Info';
import './index.less';

class Financials extends React.Component {
  componentDidMount() {
    store.fetchFinancials();
  }

  render() {
    const { contributions, grants, payouts, net } = store.financials;
    if (!store.financialsFetched) {
      return <Spin tip="Loading financials..." />;
    }

    return (
      <div className="Financials">
        <Row gutter={16}>
          <Col span={12}>
            <Card title="Accounting" size="small">
              <div className="Financials-bottomLine">
                <div>
                  <div>
                    <Info
                      content={
                        <>
                          Total amount of confirmed <b>conributions</b> (including
                          staking).
                        </>
                      }
                    />{' '}
                    gross
                  </div>
                  <div>
                    <small>&nbsp;ⓩ</small>
                    <b>{contributions.total}</b>
                  </div>
                </div>
                <div>
                  <div>
                    <Info
                      content={
                        <>
                          Total amount of refunded <b>conributions</b> (have refund
                          transaction ids).
                        </>
                      }
                    />{' '}
                    refunds
                  </div>
                  <div>
                    <small>-ⓩ</small>
                    <b>{contributions.refunded}</b>
                  </div>
                </div>
                <div>
                  <div>
                    <Info
                      content={
                        <>
                          Total milestone payouts that have been made. These payouts may
                          have been made with grants in addition to contributions.
                        </>
                      }
                    />{' '}
                    payouts
                  </div>
                  <div>
                    <small>-ⓩ</small>
                    <b>{payouts.paid}</b>
                  </div>
                </div>
                <div className="is-net">
                  <div>net</div>
                  <div>
                    <small>&nbsp;ⓩ</small>
                    <b>{net}</b>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Contributions">
              <Charts.Pie
                hasLegend
                title="Contributions"
                subTitle="Total"
                total={() => (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: 'ⓩ ' + contributions.total,
                    }}
                  />
                )}
                data={[
                  { x: 'funded', y: parseFloat(contributions.funded) },
                  { x: 'funding', y: parseFloat(contributions.funding) },
                  { x: 'refunding', y: parseFloat(contributions.refunding) },
                  { x: 'refunded', y: parseFloat(contributions.refunded) },
                  { x: 'staking', y: parseFloat(contributions.staking) },
                ]}
                valueFormat={val => <span dangerouslySetInnerHTML={{ __html: val }} />}
                height={180}
              />
            </Card>

            <Card size="small" title="Grants">
              <Charts.Pie
                hasLegend
                title="Grants"
                subTitle="Total"
                total={() => (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: 'ⓩ ' + grants.total,
                    }}
                  />
                )}
                data={[
                  { x: 'bounties', y: parseFloat(grants.bounty) },
                  { x: 'matching', y: parseFloat(grants.matching) },
                ]}
                valueFormat={val => <span dangerouslySetInnerHTML={{ __html: val }} />}
                height={180}
              />
            </Card>

            <Card size="small" title="Payouts">
              <Charts.Pie
                hasLegend
                title="Payouts"
                subTitle="Total"
                total={() => (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: 'ⓩ ' + payouts.total,
                    }}
                  />
                )}
                data={[
                  { x: 'due', y: parseFloat(payouts.due) },
                  { x: 'future', y: parseFloat(payouts.future) },
                  { x: 'paid', y: parseFloat(payouts.paid) },
                ]}
                valueFormat={val => <span dangerouslySetInnerHTML={{ __html: val }} />}
                height={180}
              />
            </Card>
          </Col>
        </Row>
        {/* <pre>{JSON.stringify(store.financials, null, 2)}</pre> */}
      </div>
    );
  }
}

export default view(Financials);
